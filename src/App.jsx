import React, { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from './components/Navbar';
import LiveStage from './components/LiveStage';
import AdminModal from './components/AdminModal';
import KeyboardShortcutsModal from './components/KeyboardShortcutsModal';
import { defaultQuestions } from './data/defaultQuestions';
import { soundEffects } from './utils/audio';
import { toBengaliNumber } from './utils/bengali';

export default function App() {
  // Check if current URL is loaded as pure Display window (?view=display)
  const isDisplayRoute = typeof window !== 'undefined' && 
    new URLSearchParams(window.location.search).get('view') === 'display';

  // Questions State
  const [questions, setQuestions] = useState(() => {
    try {
      const saved = localStorage.getItem('gk_live_questions');
      return saved ? JSON.parse(saved) : defaultQuestions;
    } catch {
      return defaultQuestions;
    }
  });

  // Current Question Index
  const [currentIndex, setCurrentIndex] = useState(0);

  // Timer Configuration (Default 60 seconds)
  const [timerDuration, setTimerDuration] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  
  // NOTE: isRunning is FALSE by default so timer NEVER auto-starts!
  // It only starts when user explicitly clicks Play or presses Spacebar.
  const [isRunning, setIsRunning] = useState(false);

  // Answer State
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);

  // UI Modes
  const [isDisplayOnly, setIsDisplayOnly] = useState(isDisplayRoute);
  const [isMuted, setIsMuted] = useState(isDisplayRoute); // Mute display window by default to avoid duplicate echo
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Modals
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);

  // BroadcastChannel for instant cross-window sync
  const broadcastChannelRef = useRef(null);

  useEffect(() => {
    try {
      const channel = new BroadcastChannel('gk_live_sync_channel');
      broadcastChannelRef.current = channel;

      channel.onmessage = (event) => {
        const { type, payload } = event.data || {};
        if (type === 'STATE_UPDATE') {
          if (payload.questions) setQuestions(payload.questions);
          if (typeof payload.currentIndex === 'number') setCurrentIndex(payload.currentIndex);
          if (typeof payload.timeLeft === 'number') setTimeLeft(payload.timeLeft);
          if (typeof payload.isRunning === 'boolean') setIsRunning(payload.isRunning);
          if (typeof payload.isAnswerRevealed === 'boolean') setIsAnswerRevealed(payload.isAnswerRevealed);
          if (typeof payload.timerDuration === 'number') setTimerDuration(payload.timerDuration);
        } else if (type === 'REQUEST_SYNC' && !isDisplayRoute) {
          // Send current state to newly opened display window
          channel.postMessage({
            type: 'STATE_UPDATE',
            payload: {
              questions,
              currentIndex,
              timeLeft,
              isRunning,
              isAnswerRevealed,
              timerDuration
            }
          });
        }
      };

      // If this is the display window, ask the controller for initial state
      if (isDisplayRoute) {
        channel.postMessage({ type: 'REQUEST_SYNC' });
      }

      return () => {
        channel.close();
      };
    } catch {
      // Fallback
    }
  }, [isDisplayRoute, questions, currentIndex, timeLeft, isRunning, isAnswerRevealed, timerDuration]);

  // Helper to broadcast state changes from Controller window
  const broadcastState = useCallback((patch) => {
    if (isDisplayRoute) return;
    if (broadcastChannelRef.current) {
      broadcastChannelRef.current.postMessage({
        type: 'STATE_UPDATE',
        payload: patch
      });
    }
  }, [isDisplayRoute]);

  // Save questions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gk_live_questions', JSON.stringify(questions));
      broadcastState({ questions });
    } catch {
      // Ignore
    }
  }, [questions, broadcastState]);

  // Sync Fullscreen state
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
  };

  // Timer Countdown Logic (Only runs when isRunning === true)
  useEffect(() => {
    let interval = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            broadcastState({ timeLeft: 0, isRunning: false, isAnswerRevealed: true });
            return 0;
          }
          if (!isMuted) {
            soundEffects.playTick(prev <= 10);
          }
          const nextVal = prev - 1;
          broadcastState({ timeLeft: nextVal });
          return nextVal;
        });
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      setIsAnswerRevealed(true);
      broadcastState({ isRunning: false, isAnswerRevealed: true });
      if (!isMuted) {
        soundEffects.playReveal();
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, isMuted, broadcastState]);

  // Actions
  const handleTogglePlay = useCallback(() => {
    setIsRunning((prev) => {
      const next = !prev;
      broadcastState({ isRunning: next });
      return next;
    });
  }, [broadcastState]);

  const handleResetTimer = useCallback((newDuration) => {
    const dur = typeof newDuration === 'number' ? newDuration : timerDuration;
    setTimeLeft(dur);
    setIsRunning(false); // Do NOT auto-start on reset!
    setIsAnswerRevealed(false);
    broadcastState({ timeLeft: dur, isRunning: false, isAnswerRevealed: false });
  }, [timerDuration, broadcastState]);

  const handleRevealAnswer = useCallback(() => {
    setIsAnswerRevealed((prev) => {
      const nextState = !prev;
      broadcastState({ isAnswerRevealed: nextState });
      if (nextState && !isMuted) {
        soundEffects.playReveal();
      }
      return nextState;
    });
  }, [isMuted, broadcastState]);

  const handleNextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      setTimeLeft(timerDuration);
      setIsRunning(false); // Do NOT auto-start on next question!
      setIsAnswerRevealed(false);
      broadcastState({
        currentIndex: nextIdx,
        timeLeft: timerDuration,
        isRunning: false,
        isAnswerRevealed: false
      });
      if (!isMuted) soundEffects.playSlide();
    }
  }, [currentIndex, questions.length, timerDuration, isMuted, broadcastState]);

  const handlePrevQuestion = useCallback(() => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      setTimeLeft(timerDuration);
      setIsRunning(false); // Do NOT auto-start on prev question!
      setIsAnswerRevealed(false);
      broadcastState({
        currentIndex: prevIdx,
        timeLeft: timerDuration,
        isRunning: false,
        isAnswerRevealed: false
      });
      if (!isMuted) soundEffects.playSlide();
    }
  }, [currentIndex, timerDuration, isMuted, broadcastState]);

  // Keyboard Shortcuts (Works in both Controller and Display windows)
  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = e.target.tagName.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || e.target.isContentEditable) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'Enter' || e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleRevealAnswer();
      } else if (e.code === 'ArrowRight' || e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleNextQuestion();
      } else if (e.code === 'ArrowLeft' || e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrevQuestion();
      } else if (e.key.toLowerCase() === 't') {
        e.preventDefault();
        handleResetTimer();
      } else if (e.key.toLowerCase() === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        setIsMuted((prev) => !prev);
      } else if (e.key === 'Escape') {
        if (isAdminOpen) setIsAdminOpen(false);
        if (isShortcutsOpen) setIsShortcutsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleTogglePlay, 
    handleRevealAnswer, 
    handleNextQuestion, 
    handlePrevQuestion, 
    handleResetTimer, 
    isAdminOpen, 
    isShortcutsOpen
  ]);

  const currentQuestion = questions[currentIndex] || questions[0];

  // ==========================================================
  // CASE A: DEDICATED CLEAN DISPLAY OUTPUT WINDOW (?view=display)
  // Perfectly captures ONLY the marked card in OBS
  // ==========================================================
  if (isDisplayRoute || isDisplayOnly) {
    return (
      <div className="min-h-screen w-full bg-black text-white flex flex-col items-center justify-center relative overflow-hidden font-tiro p-4 select-none">
        
        {/* Subtle Ambient Apple Specular Reflection */}
        <div className="absolute inset-0 apple-dark-bg pointer-events-none" />

        {/* Minimal return to controller button (Only shows if in-page toggle, hidden if in popout) */}
        {!isDisplayRoute && (
          <button
            onClick={() => setIsDisplayOnly(false)}
            className="absolute top-4 right-4 z-50 apple-btn-secondary px-3.5 py-1.5 rounded-xl text-xs font-tiro opacity-20 hover:opacity-100 transition-opacity"
          >
            কন্ট্রোলারে ফিরুন
          </button>
        )}

        {/* Render STRICTLY the marked card */}
        <div className="w-full flex items-center justify-center z-10 animate-fade-in">
          <LiveStage
            question={currentQuestion}
            currentIndex={currentIndex}
            totalQuestions={questions.length}
            timeLeft={timeLeft}
            totalTime={timerDuration}
            isRunning={isRunning}
            isAnswerRevealed={isAnswerRevealed}
            onTogglePlay={handleTogglePlay}
            onResetTimer={handleResetTimer}
            onRevealAnswer={handleRevealAnswer}
            onNextQuestion={handleNextQuestion}
            onPrevQuestion={handlePrevQuestion}
            isDisplayOnly={true}
          />
        </div>
      </div>
    );
  }

  // ==========================================================
  // CASE B: PRESENTER CONTROLLER STUDIO VIEW
  // ==========================================================
  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-tiro select-none apple-dark-bg">
      
      {/* Top Navbar */}
      <Navbar
        isDisplayOnly={isDisplayOnly}
        setIsDisplayOnly={setIsDisplayOnly}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
        openAdminModal={() => setIsAdminOpen(true)}
        openShortcutsModal={() => setIsShortcutsOpen(true)}
        timerDuration={timerDuration}
        setTimerDuration={setTimerDuration}
        onResetTimer={handleResetTimer}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 relative">
        <LiveStage
          question={currentQuestion}
          currentIndex={currentIndex}
          totalQuestions={questions.length}
          timeLeft={timeLeft}
          totalTime={timerDuration}
          isRunning={isRunning}
          isAnswerRevealed={isAnswerRevealed}
          onTogglePlay={handleTogglePlay}
          onResetTimer={handleResetTimer}
          onRevealAnswer={handleRevealAnswer}
          onNextQuestion={handleNextQuestion}
          onPrevQuestion={handlePrevQuestion}
          isDisplayOnly={false}
        />
      </main>

      {/* Footer Info */}
      <footer className="w-full max-w-5xl mx-auto px-4 py-3 mb-2 flex items-center justify-between text-xs text-zinc-400 border-t border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-white" />
          <span>কন্ট্রোলার প্রস্তুত • টাইমার নিয়ন্ত্রণ করুন</span>
          <span>•</span>
          <span>মোট {toBengaliNumber(questions.length)} টি প্রশ্ন</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsShortcutsOpen(true)} 
            className="hover:text-white transition-colors"
          >
            কিবোর্ড শর্টকাট
          </button>
          <span>•</span>
          <span>Apple Dark Glass • Tiro Bangla</span>
        </div>
      </footer>

      {/* Admin / Question Management Modal */}
      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        questions={questions}
        setQuestions={(qs) => {
          setQuestions(qs);
          broadcastState({ questions: qs });
        }}
        currentIndex={currentIndex}
        setCurrentIndex={(idx) => {
          setCurrentIndex(idx);
          setTimeLeft(timerDuration);
          setIsRunning(false); // Do NOT auto start when jumping to question
          setIsAnswerRevealed(false);
          broadcastState({
            currentIndex: idx,
            timeLeft: timerDuration,
            isRunning: false,
            isAnswerRevealed: false
          });
        }}
      />

      {/* Keyboard Shortcuts Cheat Sheet Modal */}
      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}
