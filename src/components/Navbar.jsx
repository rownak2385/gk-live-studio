import React from 'react';
import { 
  Tv, 
  Settings, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  Keyboard, 
  ExternalLink,
  Copy,
  Clock,
  Sparkles,
  Monitor
} from 'lucide-react';
import { toBengaliNumber } from '../utils/bengali';

export default function Navbar({
  isDisplayOnly,
  setIsDisplayOnly,
  isMuted,
  setIsMuted,
  isFullscreen,
  toggleFullscreen,
  openAdminModal,
  openShortcutsModal,
  timerDuration,
  setTimerDuration,
  onResetTimer,
  openPopoutDisplay
}) {
  const durations = [30, 45, 60, 90];

  const handleCopyOBSUrl = () => {
    const url = `${window.location.origin}/?view=display`;
    navigator.clipboard.writeText(url).then(() => {
      alert(`OBS ব্রাউজার সোর্স লিংক কপি করা হয়েছে:\n${url}`);
    }).catch(() => {
      prompt("OBS ব্রাউজার সোর্স লিংক:", url);
    });
  };

  return (
    <header className="w-full px-4 md:px-8 py-3 flex items-center justify-between z-40 relative border-b border-white/10 bg-black/40 backdrop-blur-xl">
      {/* Brand Logo & Title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-2xl bg-white/10 p-0.5 border border-white/20 shadow-md flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-tiro text-base md:text-lg font-bold text-white tracking-wide">
              লাইভ কুইজ স্টুডিও
            </h1>
            <span className="hidden sm:inline-block font-sans text-[10px] uppercase tracking-wider font-extrabold px-2 py-0.5 rounded-full bg-white/10 text-white border border-white/15">
              Apple Dark Glass
            </span>
          </div>
          <p className="font-tiro text-[11px] text-zinc-400 hidden md:block">
            কন্ট্রোলার ও ব্রডকাস্ট ইঞ্জিন
          </p>
        </div>
      </div>

      {/* Center Display Output Triggers */}
      <div className="flex items-center gap-2">
        {/* Open Dedicated Pop-out Display Window (For OBS Window/Display Capture) */}
        <button
          onClick={openPopoutDisplay}
          className="apple-btn px-3.5 py-1.5 rounded-xl font-tiro text-xs md:text-sm font-bold text-white flex items-center gap-2 shadow-lg"
          title="OBS-এ ডিসপ্লে ক্যাপচারের জন্য আলাদা উইন্ডো খুলুন"
        >
          <ExternalLink className="w-4 h-4 text-white" />
          <span>আলাদা ডিসপ্লে উইন্ডো (OBS)</span>
        </button>

        {/* In-window clean toggle */}
        <button
          onClick={() => setIsDisplayOnly(!isDisplayOnly)}
          className={`font-tiro px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-semibold flex items-center gap-1.5 transition-all ${
            isDisplayOnly
              ? 'apple-btn text-white'
              : 'apple-btn-secondary text-zinc-300'
          }`}
          title="এই উইন্ডোতেই শুধু কার্ডটি দেখতে টগল করুন"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{isDisplayOnly ? 'কন্ট্রোলার ভিউ' : 'ক্লিন কার্ড ভিউ'}</span>
        </button>
      </div>

      {/* Right Controls Toolset */}
      <div className="flex items-center gap-2 md:gap-2.5">
        {/* Copy OBS Browser Source URL */}
        <button
          onClick={handleCopyOBSUrl}
          className="apple-btn-secondary p-2.5 rounded-xl text-zinc-300 hover:text-white hidden lg:flex items-center gap-1.5 font-tiro text-xs"
          title="OBS Browser Source হিসেবে ব্যবহার করার লিংক কপি করুন"
        >
          <Copy className="w-3.5 h-3.5" />
          <span>OBS লিংক</span>
        </button>

        {/* Timer Duration Dropdown */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 font-tiro text-xs text-zinc-300">
          <Clock className="w-3.5 h-3.5 text-zinc-300" />
          <span>সময়:</span>
          <select
            value={timerDuration}
            onChange={(e) => {
              const val = Number(e.target.value);
              setTimerDuration(val);
              onResetTimer(val);
            }}
            className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
          >
            {durations.map((d) => (
              <option key={d} value={d} className="bg-black text-white">
                {toBengaliNumber(d)} সেকেন্ড
              </option>
            ))}
          </select>
        </div>

        {/* Audio Toggle */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          className={`p-2.5 rounded-xl transition-all ${
            isMuted 
              ? 'bg-white/5 text-zinc-500 border border-white/10' 
              : 'apple-btn-secondary text-white'
          }`}
          title={isMuted ? "সাউন্ড অন করুন (M)" : "সাউন্ড মিউট করুন (M)"}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>

        {/* Keyboard Shortcuts Helper */}
        <button
          onClick={openShortcutsModal}
          className="apple-btn-secondary p-2.5 rounded-xl text-zinc-300 hover:text-white hidden sm:block"
          title="কিবোর্ড শর্টকাট তালিকা"
        >
          <Keyboard className="w-4 h-4" />
        </button>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className="apple-btn-secondary p-2.5 rounded-xl text-zinc-300 hover:text-white"
          title="ফুলস্ক্রিন (F)"
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        {/* Question Management Studio Button */}
        <button
          onClick={openAdminModal}
          className="apple-btn px-3.5 py-1.5 rounded-xl font-tiro text-xs md:text-sm font-bold text-white flex items-center gap-1.5 shadow-lg"
        >
          <Settings className="w-4 h-4" />
          <span className="hidden sm:inline">প্রশ্ন ম্যানেজ করুন</span>
          <span className="sm:hidden">প্রশ্ন</span>
        </button>
      </div>
    </header>
  );
}
