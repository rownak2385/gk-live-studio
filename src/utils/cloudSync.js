// Cloud Real-time Pub/Sub Sync for OBS Studio & Cross-Device Control
// Uses free, high-speed public SSE & PubSub (Zero config, sub-50ms latency)

const DEFAULT_ROOM = 'gk-live-studio-rownak2385';

export function getRoomId() {
  if (typeof window === 'undefined') return DEFAULT_ROOM;
  const params = new URLSearchParams(window.location.search);
  return params.get('room') || DEFAULT_ROOM;
}

// Publish state to cloud
let lastPublishTime = 0;
let pendingState = null;
let publishTimer = null;

export async function publishCloudState(state, forceImmediate = false) {
  const room = getRoomId();
  const url = `https://ntfy.sh/${room}`;

  // If immediate action (Next/Prev question, Play/Pause, Reveal, Questions list), send right away
  if (forceImmediate) {
    if (publishTimer) {
      clearTimeout(publishTimer);
      publishTimer = null;
    }
    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Title': 'GK_LIVE_STATE'
        },
        body: JSON.stringify(state)
      });
      lastPublishTime = Date.now();
    } catch {
      // Ignore network hiccup
    }
    return;
  }

  // Throttle timer tick publishes to max once every 900ms
  pendingState = state;
  const now = Date.now();
  if (now - lastPublishTime >= 900) {
    lastPublishTime = now;
    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Title': 'GK_LIVE_STATE'
        },
        body: JSON.stringify(pendingState)
      });
      pendingState = null;
    } catch {
      // Ignore
    }
  } else if (!publishTimer) {
    publishTimer = setTimeout(async () => {
      publishTimer = null;
      if (pendingState) {
        lastPublishTime = Date.now();
        try {
          await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Title': 'GK_LIVE_STATE'
            },
            body: JSON.stringify(pendingState)
          });
          pendingState = null;
        } catch {
          // Ignore
        }
      }
    }, 950);
  }
}

// Subscribe to state changes in OBS Studio or Display Window
export function subscribeCloudState(onStateReceived) {
  const room = getRoomId();
  let eventSource = null;
  let isSubscribed = true;

  // 1. First fetch latest cached state immediately on load
  fetch(`https://ntfy.sh/${room}/json?poll=1`)
    .then((res) => res.text())
    .then((text) => {
      if (!isSubscribed || !text) return;
      // ntfy can return multiple lines of json objects
      const lines = text.trim().split('\n').filter(Boolean);
      for (let i = lines.length - 1; i >= 0; i--) {
        try {
          const envelope = JSON.parse(lines[i]);
          if (envelope && envelope.message) {
            const parsed = typeof envelope.message === 'string' ? JSON.parse(envelope.message) : envelope.message;
            if (parsed && (parsed.questions || typeof parsed.currentIndex === 'number')) {
              onStateReceived(parsed);
              break;
            }
          }
        } catch {
          // continue
        }
      }
    })
    .catch(() => {});

  // 2. Open Real-time Server-Sent Events (SSE) connection (native in all browsers & OBS CEF)
  function connectSSE() {
    if (!isSubscribed) return;
    try {
      eventSource = new EventSource(`https://ntfy.sh/${room}/sse`);

      eventSource.onmessage = (event) => {
        try {
          const envelope = JSON.parse(event.data);
          if (envelope && envelope.message) {
            const parsed = typeof envelope.message === 'string' ? JSON.parse(envelope.message) : envelope.message;
            if (parsed && (parsed.questions || typeof parsed.currentIndex === 'number' || typeof parsed.timeLeft === 'number')) {
              onStateReceived(parsed);
            }
          }
        } catch {
          // Ignore malformed message
        }
      };

      eventSource.onerror = () => {
        if (eventSource) {
          eventSource.close();
          eventSource = null;
        }
        // Auto-reconnect after 2 seconds
        if (isSubscribed) {
          setTimeout(connectSSE, 2000);
        }
      };
    } catch {
      // Fallback polling if SSE fails
      setTimeout(connectSSE, 3000);
    }
  }

  connectSSE();

  return () => {
    isSubscribed = false;
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
}
