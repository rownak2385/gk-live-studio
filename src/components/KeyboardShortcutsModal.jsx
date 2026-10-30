import React from 'react';
import { X, Keyboard } from 'lucide-react';

export default function KeyboardShortcutsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'Space', desc: 'টাইমার শুরু / বিরতি (Play / Pause)' },
    { key: 'Enter / R', desc: 'সঠিক উত্তর প্রকাশ করুন (Reveal Answer)' },
    { key: '→ (Right) / N', desc: 'পরবর্তী প্রশ্নে যান (Next Question)' },
    { key: '← (Left) / P', desc: 'পূর্ববর্তী প্রশ্নে ফিরুন (Previous Question)' },
    { key: 'T', desc: 'টাইমার পুনরায় ৬০ সেকেন্ডে রিসেট করুন' },
    { key: 'F', desc: 'ফুলস্ক্রিন মোড চালু / বন্ধ' },
    { key: 'M', desc: 'শব্দ অন / অফ (Sound Toggle)' },
    { key: 'Esc', desc: 'মডাল বন্ধ করা' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-lg apple-dark-card rounded-3xl p-6 shadow-2xl border border-white/20">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2.5">
            <Keyboard className="w-5 h-5 text-white" />
            <h3 className="font-tiro text-xl font-bold text-white">
              লাইভ স্ট্রিমিং কিবোর্ড শর্টকাট
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 font-tiro">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10"
            >
              <span className="text-zinc-200 text-sm md:text-base">{s.desc}</span>
              <kbd className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/20 text-white font-sans text-xs font-semibold shadow-inner">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-white/10 text-center">
          <button
            onClick={onClose}
            className="apple-btn px-6 py-2 rounded-xl text-white font-tiro text-sm font-semibold"
          >
            বুঝেছি
          </button>
        </div>
      </div>
    </div>
  );
}
