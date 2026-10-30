import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  CheckCircle2, 
  HelpCircle, 
  Play, 
  Pause, 
  RotateCcw, 
  ChevronRight, 
  ChevronLeft, 
  Eye, 
  Sparkles,
  Info,
  Flame,
  Clock,
  BookOpen
} from 'lucide-react';
import CircularTimer from './CircularTimer';
import { toBengaliNumber } from '../utils/bengali';

export default function LiveStage({
  question,
  currentIndex,
  totalQuestions,
  timeLeft,
  totalTime = 60,
  isRunning,
  isAnswerRevealed,
  onTogglePlay,
  onResetTimer,
  onRevealAnswer,
  onNextQuestion,
  onPrevQuestion,
  isDisplayOnly = false,
}) {
  // Fire colorful celebration confetti when answer is revealed
  useEffect(() => {
    if (isAnswerRevealed) {
      try {
        confetti({
          particleCount: 65,
          spread: 80,
          origin: { y: 0.65 },
          colors: ['#00f5ff', '#10b981', '#fbbf24', '#f43f5e', '#a855f7', '#ffffff']
        });
      } catch {
        // Safe fail
      }
    }
  }, [isAnswerRevealed]);

  if (!question) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
        <div className="apple-dark-card p-10 rounded-3xl max-w-md w-full">
          <HelpCircle className="w-16 h-16 text-zinc-400 mx-auto mb-4 animate-pulse" />
          <h2 className="font-tiro text-2xl font-bold text-white mb-2">কোনো প্রশ্ন পাওয়া যায়নি</h2>
          <p className="font-tiro text-zinc-400">দয়া করে কন্ট্রোলার থেকে প্রশ্ন যোগ করুন।</p>
        </div>
      </div>
    );
  }

  const banglaIndex = toBengaliNumber(currentIndex + 1 < 10 ? `0${currentIndex + 1}` : currentIndex + 1);
  const banglaTotal = toBengaliNumber(totalQuestions < 10 ? `0${totalQuestions}` : totalQuestions);
  const progressPercent = Math.max(0, Math.min(100, (timeLeft / totalTime) * 100));

  // Option badge styles with distinct Apple jewel colors
  const optionStyles = [
    { 
      letter: 'ক', 
      badge: 'bg-cyan-500/25 text-cyan-300 border-cyan-400/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]',
      borderHover: 'hover:border-cyan-400/50 hover:bg-cyan-500/[0.08]'
    },
    { 
      letter: 'খ', 
      badge: 'bg-purple-500/25 text-purple-300 border-purple-400/40 shadow-[0_0_12px_rgba(168,85,247,0.3)]',
      borderHover: 'hover:border-purple-400/50 hover:bg-purple-500/[0.08]'
    },
    { 
      letter: 'গ', 
      badge: 'bg-amber-500/25 text-amber-300 border-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.3)]',
      borderHover: 'hover:border-amber-400/50 hover:bg-amber-500/[0.08]'
    },
    { 
      letter: 'ঘ', 
      badge: 'bg-emerald-500/25 text-emerald-300 border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.3)]',
      borderHover: 'hover:border-emerald-400/50 hover:bg-emerald-500/[0.08]'
    }
  ];

  return (
    <div className={`w-full flex flex-col items-center justify-center relative ${
      isDisplayOnly ? 'max-w-6xl p-4 md:p-8' : 'max-w-5xl px-4 py-3 md:py-6'
    }`}>
      
      {/* Background Subtle Neon Ambient Bleed */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 h-4/5 rounded-full blur-[130px] pointer-events-none transition-colors duration-1000 ${
        timeLeft <= 15 ? 'bg-rose-600/10' : timeLeft <= 30 ? 'bg-amber-500/10' : 'bg-cyan-500/10'
      }`} />

      {/* ==========================================================
          THE MAIN BROADCAST QUIZ CARD (FOR DISPLAY / OBS CAPTURE)
         ========================================================== */}
      <div className="w-full apple-dark-card rounded-[2.5rem] p-6 md:p-10 relative overflow-hidden backdrop-blur-3xl transition-all duration-300">
        
        {/* Top Specular Neon Light Accent */}
        <div className={`absolute top-0 inset-x-0 h-1 transition-all duration-700 bg-gradient-to-r ${
          timeLeft <= 15 
            ? 'from-transparent via-rose-500/60 to-transparent' 
            : timeLeft <= 30 
            ? 'from-transparent via-amber-400/60 to-transparent' 
            : 'from-transparent via-cyan-400/60 to-transparent'
        }`} />

        {/* Card Header: Question Counter & Category Badge */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
          <div className="flex items-center gap-3">
            
            {/* Question Counter (Apple Royal Violet Neon) */}
            <div className="px-4 py-1.5 rounded-full flex items-center gap-2.5 bg-gradient-to-r from-violet-600/30 via-indigo-600/25 to-purple-600/20 border border-violet-400/40 shadow-[0_0_15px_rgba(139,92,246,0.3)]">
              <span className="w-2.5 h-2.5 rounded-full bg-violet-400 shadow-[0_0_8px_#c084fc] animate-pulse" />
              <span className="font-tiro text-sm md:text-base font-bold text-violet-200">
                প্রশ্ন {banglaIndex} / {banglaTotal}
              </span>
            </div>

            {/* Category Tag (Golden Amber Prestige Neon) */}
            {question.category && (
              <div className="px-4 py-1.5 rounded-full flex items-center gap-1.5 bg-gradient-to-r from-amber-500/25 to-orange-500/20 border border-amber-400/40 text-amber-300 shadow-[0_0_14px_rgba(245,158,11,0.25)] font-tiro text-xs md:text-sm font-semibold">
                <Flame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                <span>{question.category}</span>
              </div>
            )}
          </div>

          {/* Time Running Status Pill (Clear indicator whether timer is ready, playing, or paused) */}
          <div className="flex items-center gap-2">
            {isRunning ? (
              <span className="font-tiro text-xs md:text-sm font-semibold text-emerald-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                সময় গণনা চলছে...
              </span>
            ) : timeLeft === 0 ? (
              <span className="font-tiro text-xs md:text-sm font-semibold text-rose-400 flex items-center gap-1.5">
                সময় সমাপ্ত
              </span>
            ) : timeLeft === totalTime ? (
              <span className="font-tiro text-xs md:text-sm font-semibold text-amber-300 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                টাইমার প্রস্তুত (ক্লিক করে শুরু করুন)
              </span>
            ) : (
              <span className="font-tiro text-xs md:text-sm font-semibold text-zinc-400 flex items-center gap-1.5">
                <Pause className="w-3.5 h-3.5 text-zinc-400" />
                টাইমার বিরতি
              </span>
            )}
          </div>
        </div>

        {/* Central Grid: Question & Neon Circular Timer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-8">
          
          {/* Question Text Body */}
          <div className="lg:col-span-9 flex flex-col justify-center">
            <h1 className="font-tiro text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-relaxed md:leading-normal drop-shadow-md text-left">
              {question.question}
            </h1>
          </div>

          {/* Dynamic Neon Circular Countdown Timer */}
          <div className="lg:col-span-3 flex justify-center lg:justify-end">
            <CircularTimer 
              timeLeft={timeLeft} 
              totalTime={totalTime} 
              isRunning={isRunning} 
            />
          </div>
        </div>

        {/* Multiple Choice Options Grid (Apple Jewel Colors) */}
        {question.options && question.options.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mb-7">
            {question.options.map((option, idx) => {
              const optStyle = optionStyles[idx % optionStyles.length];
              const isThisCorrect = isAnswerRevealed && option.trim().toLowerCase() === question.answer.trim().toLowerCase();

              return (
                <div
                  key={idx}
                  className={`flex items-center gap-3.5 p-4 rounded-2xl font-tiro text-base md:text-lg border transition-all duration-300 ${
                    isThisCorrect
                      ? 'bg-emerald-500/25 border-emerald-400/80 shadow-[0_0_30px_rgba(16,185,129,0.45)] scale-[1.02] text-white font-bold'
                      : `apple-glass-option ${optStyle.borderHover} text-zinc-100`
                  }`}
                >
                  {/* Jewel Letter Badge (ক, খ, গ, ঘ) */}
                  <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold border ${
                    isThisCorrect 
                      ? 'bg-emerald-400 text-black border-emerald-300 shadow-[0_0_15px_#34d399]' 
                      : optStyle.badge
                  }`}>
                    {optStyle.letter || toBengaliNumber(idx + 1)}
                  </span>
                  
                  <span className="flex-1 text-left font-medium">{option}</span>
                  
                  {isThisCorrect && (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-bounce" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ==========================================================
            DEDICATED SECTION INSIDE CARD:
            সঠিক উত্তর ও অতিরিক্ত তথ্য / ব্যাখ্যা (Explanation / Facts)
           ========================================================== */}
        <div className="min-h-[100px] flex items-center justify-center">
          {isAnswerRevealed ? (
            /* Radiant Answer & Fact Reveal Card (Emerald & Gold Neon) */
            <div className="w-full rounded-3xl p-6 md:p-7 animate-flip-in text-center relative overflow-hidden bg-gradient-to-br from-emerald-950/70 via-slate-900/90 to-emerald-950/60 border-2 border-emerald-400/60 shadow-[0_0_50px_rgba(16,185,129,0.35)]">
              <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-emerald-400/20 rounded-full blur-2xl pointer-events-none" />
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/25 text-emerald-300 text-xs md:text-sm font-tiro font-bold mb-2.5 border border-emerald-400/50 shadow-[0_0_12px_rgba(16,185,129,0.3)]">
                <Sparkles className="w-4 h-4 text-emerald-300 animate-spin" style={{ animationDuration: '4s' }} />
                সঠিক উত্তর
              </div>

              <div className="font-tiro text-2xl md:text-4xl font-extrabold text-emerald-300 drop-shadow-[0_0_20px_rgba(52,211,153,0.7)] mb-2">
                {question.answer}
              </div>

              {/* অতিরিক্ত ব্যাখ্যা বা তথ্য */}
              {question.explanation && (
                <div className="mt-3.5 pt-3 border-t border-emerald-500/30 text-emerald-100/95 font-tiro text-sm md:text-base flex items-center justify-center gap-2.5 max-w-2xl mx-auto bg-black/20 p-3 rounded-2xl">
                  <BookOpen className="w-5 h-5 text-amber-300 flex-shrink-0" />
                  <span className="text-left leading-relaxed">
                    <strong className="text-amber-300 font-bold">অতিরিক্ত তথ্য: </strong>
                    {question.explanation}
                  </span>
                </div>
              )}
            </div>
          ) : (
            /* Inside Card Placeholder reserved for facts & explanation */
            <div className="w-full p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between text-zinc-300 font-tiro">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <span className="text-sm md:text-base font-semibold text-white">
                    {question.explanation ? 'অতিরিক্ত তথ্য ও ব্যাখ্যা সংযুক্ত আছে' : 'সাধারণ জ্ঞান কুইজ'}
                  </span>
                  <p className="text-xs text-zinc-400">
                    সময় শেষ হলে সঠিক উত্তরের সাথে বিস্তারিত তথ্য স্ক্রিনে প্রদর্শিত হবে
                  </p>
                </div>
              </div>

              <span className="text-xs px-3 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-400 hidden sm:inline-block">
                ১ মিনিট সময়
              </span>
            </div>
          )}
        </div>

      </div>

      {/* ==========================================================
          PRESENTER CONTROLS & ANTICIPATION BAR 
          (Placed below the main card)
         ========================================================== */}
      {!isDisplayOnly && (
        <div className="w-full max-w-3xl mt-5 space-y-3">
          
          {/* Anticipation Bar: "সময় শেষ হলে উত্তর স্বয়ংক্রিয়ভাবে প্রদর্শিত হবে" */}
          <div className="w-full rounded-2xl bg-white/[0.04] border border-white/15 p-3.5 md:p-4 relative overflow-hidden backdrop-blur-xl">
            {/* Linear Countdown Progress Track */}
            <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10">
              <div 
                className={`h-full transition-all duration-1000 ease-linear ${
                  timeLeft <= 15 
                    ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' 
                    : timeLeft <= 30 
                    ? 'bg-amber-400 shadow-[0_0_10px_#fbbf24]' 
                    : 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 font-tiro">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors duration-500 ${
                  timeLeft <= 15 ? 'bg-rose-500/20 text-rose-400' : 'bg-cyan-500/20 text-cyan-300'
                }`}>
                  <Clock className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
                </div>
                <div>
                  <span className="text-xs md:text-sm font-semibold text-white">
                    {isRunning 
                      ? 'টাইমার চলছে • ১ মিনিট শেষ হলে উত্তর স্বয়ংক্রিয়ভাবে দেখাবে' 
                      : timeLeft === 0 
                      ? 'সময় সমাপ্ত! সঠিক উত্তর উন্মোচিত' 
                      : 'টাইমার শুরু করতে প্লে (বা Space) চাপুন'}
                  </span>
                </div>
              </div>

              <button
                onClick={onRevealAnswer}
                className="px-4 py-2 rounded-xl font-tiro text-xs md:text-sm font-bold text-white flex items-center gap-1.5 transition-all duration-200 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              >
                <Eye className="w-4 h-4" />
                {isAnswerRevealed ? 'উত্তর লুকান' : 'এখনই দেখুন'}
              </button>
            </div>
          </div>

          {/* Presenter Control Bar (Prev, Play/Pause, Reset, Next) */}
          <div className="w-full flex items-center justify-between gap-3 px-6 py-3 rounded-2xl apple-dark-card border border-white/15">
            <button
              onClick={onPrevQuestion}
              disabled={currentIndex === 0}
              className="apple-btn-secondary px-4 py-2 rounded-xl flex items-center gap-1.5 font-tiro text-sm md:text-base text-zinc-200 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="w-4 h-4" />
              পূর্ববর্তী
            </button>

            <div className="flex items-center gap-2">
              {/* Play / Pause with glowing invitation if not running */}
              <button
                onClick={onTogglePlay}
                title={isRunning ? "টাইমার থামান (Space)" : "টাইমার শুরু করুন (Space)"}
                className={`p-3 rounded-xl text-white transition-all duration-300 ${
                  !isRunning && timeLeft > 0
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 shadow-[0_0_20px_rgba(16,185,129,0.5)] scale-105 hover:scale-110'
                    : 'apple-btn shadow-xl'
                }`}
              >
                {isRunning ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5 translate-x-0.5 fill-white text-white" />
                )}
              </button>

              {/* Reset Timer */}
              <button
                onClick={onResetTimer}
                title="টাইমার পুনরায় শুরু করুন"
                className="apple-btn-secondary p-3 rounded-xl text-zinc-300 hover:text-white"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              {/* Reveal / Hide Answer Toggle */}
              <button
                onClick={onRevealAnswer}
                className={`px-4 py-2 rounded-xl font-tiro text-sm font-semibold flex items-center gap-1.5 transition-all ${
                  isAnswerRevealed
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                    : 'apple-btn text-white'
                }`}
              >
                <Eye className="w-4 h-4" />
                {isAnswerRevealed ? 'উত্তর লুকান' : 'উত্তর দেখুন'}
              </button>
            </div>

            <button
              onClick={onNextQuestion}
              disabled={currentIndex === totalQuestions - 1}
              className="apple-btn px-5 py-2 rounded-xl flex items-center gap-1.5 font-tiro text-sm md:text-base text-white font-medium disabled:opacity-30 disabled:pointer-events-none"
            >
              পরবর্তী
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
