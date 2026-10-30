import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  ArrowUp, 
  ArrowDown, 
  Download, 
  Upload, 
  RotateCcw,
  ListOrdered,
  FileText,
  CheckCircle,
  Sparkles
} from 'lucide-react';
import { toBengaliNumber } from '../utils/bengali';
import { defaultQuestions } from '../data/defaultQuestions';

// Standard categories specified by the user
export const PREDEFINED_CATEGORIES = [
  "বাংলাদেশ বিষয়াবলী",
  "আন্তর্জাতিক বিষয়াবলী",
  "তথ্য ও যোগাযোগ প্রযুক্তি",
  "বাংলাদেশ ও বিশ্ব পরিচয়",
  "বিজ্ঞান",
  "বুদ্ধিমত্তা"
];

export default function AdminModal({
  isOpen,
  onClose,
  questions,
  setQuestions,
  currentIndex,
  setCurrentIndex
}) {
  const [activeTab, setActiveTab] = useState('list'); // 'list' | 'add' | 'bulk'
  const [editingId, setEditingId] = useState(null);

  // Form states
  const [selectedCategory, setSelectedCategory] = useState(PREDEFINED_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  const [questionText, setQuestionText] = useState('');
  const [answerText, setAnswerText] = useState('');
  
  // 4 Dedicated options
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [opt4, setOpt4] = useState('');

  const [explanation, setExplanation] = useState('');

  // Bulk import state
  const [bulkText, setBulkText] = useState('');
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setEditingId(null);
    setQuestionText('');
    setAnswerText('');
    setSelectedCategory(PREDEFINED_CATEGORIES[0]);
    setIsCustomCategory(false);
    setCustomCategory('');
    setOpt1('');
    setOpt2('');
    setOpt3('');
    setOpt4('');
    setExplanation('');
    setActiveTab('add');
  };

  const handleStartEdit = (q) => {
    setEditingId(q.id);
    setQuestionText(q.question);
    setAnswerText(q.answer);

    if (PREDEFINED_CATEGORIES.includes(q.category)) {
      setSelectedCategory(q.category);
      setIsCustomCategory(false);
      setCustomCategory('');
    } else {
      setSelectedCategory('CUSTOM');
      setIsCustomCategory(true);
      setCustomCategory(q.category || '');
    }

    const opts = q.options || [];
    setOpt1(opts[0] || '');
    setOpt2(opts[1] || '');
    setOpt3(opts[2] || '');
    setOpt4(opts[3] || '');

    setExplanation(q.explanation || '');
    setActiveTab('add');
  };

  const handleSaveQuestion = (e) => {
    e.preventDefault();
    if (!questionText.trim() || !answerText.trim()) return;

    const finalCategory = isCustomCategory 
      ? (customCategory.trim() || 'সাধারণ জ্ঞান')
      : selectedCategory;

    // Collect 4 options, filter non-empty
    const parsedOptions = [opt1, opt2, opt3, opt4]
      .map(o => o.trim())
      .filter(Boolean);

    if (editingId) {
      setQuestions(prev => prev.map(q => {
        if (q.id === editingId) {
          return {
            ...q,
            question: questionText.trim(),
            answer: answerText.trim(),
            category: finalCategory,
            options: parsedOptions,
            explanation: explanation.trim()
          };
        }
        return q;
      }));
    } else {
      const newQuestion = {
        id: 'q-' + Date.now(),
        question: questionText.trim(),
        answer: answerText.trim(),
        category: finalCategory,
        options: parsedOptions,
        explanation: explanation.trim()
      };
      setQuestions(prev => [...prev, newQuestion]);
    }

    setActiveTab('list');
    setEditingId(null);
  };

  const handleDelete = (id) => {
    if (questions.length <= 1) {
      alert('কমপক্ষে একটি প্রশ্ন থাকতে হবে!');
      return;
    }
    const filtered = questions.filter(q => q.id !== id);
    setQuestions(filtered);
    if (currentIndex >= filtered.length) {
      setCurrentIndex(Math.max(0, filtered.length - 1));
    }
  };

  const handleMove = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= questions.length) return;

    const updated = [...questions];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setQuestions(updated);

    if (currentIndex === index) {
      setCurrentIndex(targetIndex);
    } else if (currentIndex === targetIndex) {
      setCurrentIndex(index);
    }
  };

  const handleBulkImport = () => {
    if (!bulkText.trim()) return;

    try {
      if (bulkText.trim().startsWith('[') && bulkText.trim().endsWith(']')) {
        const parsed = JSON.parse(bulkText);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const formatted = parsed.map((item, idx) => ({
            id: item.id || `q-bulk-${Date.now()}-${idx}`,
            question: item.question || 'প্রশ্ন',
            answer: item.answer || 'উত্তর',
            category: item.category || PREDEFINED_CATEGORIES[0],
            options: Array.isArray(item.options) ? item.options : [],
            explanation: item.explanation || ''
          }));
          setQuestions(prev => [...prev, ...formatted]);
          setBulkSuccessMsg(`${toBengaliNumber(formatted.length)} টি প্রশ্ন সফলভাবে যোগ করা হয়েছে!`);
          setTimeout(() => {
            setBulkSuccessMsg('');
            setActiveTab('list');
          }, 1500);
          return;
        }
      }

      const blocks = bulkText.split(/(?:---|===|\n\s*\n\s*\n)/).map(b => b.trim()).filter(Boolean);
      const parsedQuestions = [];

      for (const block of blocks) {
        const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
        let q = '', a = '', c = PREDEFINED_CATEGORIES[0], exp = '';
        let opts = [];

        for (const line of lines) {
          if (line.startsWith('প্রশ্ন:') || line.startsWith('Q:') || line.startsWith('প্রশ্ন -')) {
            q = line.replace(/^(?:প্রশ্ন:|Q:|প্রশ্ন -)\s*/, '');
          } else if (line.startsWith('উত্তর:') || line.startsWith('A:') || line.startsWith('উত্তর -')) {
            a = line.replace(/^(?:উত্তর:|A:|উত্তর -)\s*/, '');
          } else if (line.startsWith('বিষয়:') || line.startsWith('ক্যাটাগরি:')) {
            c = line.replace(/^(?:বিষয়:|ক্যাটাগরি:)\s*/, '');
          } else if (line.startsWith('ব্যাখ্যা:') || line.startsWith('তথ্য:')) {
            exp = line.replace(/^(?:ব্যাখ্যা:|তথ্য:)\s*/, '');
          } else if (line.startsWith('অপশন:') || line.startsWith('Options:')) {
            const rawOpts = line.replace(/^(?:অপশন:|Options:)\s*/, '');
            opts = rawOpts.split(/[,|;]/).map(o => o.trim()).filter(Boolean);
          }
        }

        if (q && a) {
          parsedQuestions.push({
            id: 'q-bulk-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5),
            question: q,
            answer: a,
            category: c,
            options: opts,
            explanation: exp
          });
        }
      }

      if (parsedQuestions.length > 0) {
        setQuestions(prev => [...prev, ...parsedQuestions]);
        setBulkSuccessMsg(`${toBengaliNumber(parsedQuestions.length)} টি প্রশ্ন সফলভাবে যোগ করা হয়েছে!`);
        setTimeout(() => {
          setBulkSuccessMsg('');
          setActiveTab('list');
        }, 1500);
      } else {
        alert('সঠিক ফরম্যাটে প্রশ্ন পাওয়া যায়নি। নিচের উদাহরণ অনুসরণ করুন।');
      }
    } catch {
      alert('ইমপোর্ট করতে সমস্যা হয়েছে। ফরম্যাট চেক করুন।');
    }
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(questions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `gk-questions-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleResetDefaults = () => {
    if (confirm('আপনি কি পূর্বনির্ধারিত সাধারণ জ্ঞানের প্রশ্নে ফিরে যেতে চান? আপনার কাস্টম প্রশ্নগুলো মুছে যাবে।')) {
      setQuestions(defaultQuestions);
      setCurrentIndex(0);
      setActiveTab('list');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-4xl max-h-[92vh] apple-dark-card rounded-3xl flex flex-col overflow-hidden shadow-2xl border border-white/20">
        
        {/* Modal Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            <h2 className="font-tiro text-xl md:text-2xl font-bold text-white">
              প্রশ্ন ম্যানেজমেন্ট স্টুডিও ({toBengaliNumber(questions.length)} টি প্রশ্ন)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-4 border-b border-white/10 bg-black/40">
          <button
            onClick={() => setActiveTab('list')}
            className={`font-tiro pb-3 px-4 text-sm md:text-base font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'list'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <ListOrdered className="w-4 h-4" />
            সকল প্রশ্ন ({toBengaliNumber(questions.length)})
          </button>

          <button
            onClick={handleStartAdd}
            className={`font-tiro pb-3 px-4 text-sm md:text-base font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'add'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Plus className="w-4 h-4" />
            {editingId ? 'প্রশ্ন সম্পাদনা' : 'নতুন প্রশ্ন যোগ'}
          </button>

          <button
            onClick={() => setActiveTab('bulk')}
            className={`font-tiro pb-3 px-4 text-sm md:text-base font-semibold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'bulk'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            একসাথে একাধিক যোগ (বাল্ক ইমপোর্ট)
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          
          {/* TAB 1: QUESTION LIST */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
                <button
                  onClick={handleStartAdd}
                  className="apple-btn px-4 py-2 rounded-xl text-white font-tiro text-sm font-semibold flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  নতুন প্রশ্ন যোগ করুন
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportJSON}
                    className="apple-btn-secondary px-3 py-1.5 rounded-lg text-xs md:text-sm text-zinc-300 font-tiro flex items-center gap-1.5 hover:text-white"
                  >
                    <Download className="w-3.5 h-3.5" />
                    ব্যাকআপ সেভ
                  </button>

                  <button
                    onClick={handleResetDefaults}
                    className="apple-btn-secondary px-3 py-1.5 rounded-lg text-xs md:text-sm text-zinc-400 font-tiro flex items-center gap-1.5 hover:text-white"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    রিসেট
                  </button>
                </div>
              </div>

              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    currentIndex === idx
                      ? 'bg-cyan-500/10 border-cyan-400/40 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'bg-white/5 border-white/10 hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center font-tiro text-sm font-bold text-white flex-shrink-0 mt-0.5">
                        {toBengaliNumber(idx + 1)}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-tiro text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                            {q.category || PREDEFINED_CATEGORIES[0]}
                          </span>
                          {currentIndex === idx && (
                            <span className="font-tiro text-xs text-cyan-300 font-semibold flex items-center gap-1">
                              • ডিসপ্লেতে সক্রিয়
                            </span>
                          )}
                        </div>
                        <h4 className="font-tiro text-base md:text-lg font-bold text-white mb-1.5">
                          {q.question}
                        </h4>
                        <div className="font-tiro text-sm text-emerald-300 font-semibold flex items-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-400" />
                          উত্তর: {q.answer}
                        </div>
                        {q.options && q.options.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {q.options.map((opt, i) => (
                              <span key={i} className="text-xs px-2 py-0.5 rounded-md bg-white/5 text-zinc-300 border border-white/10 font-tiro">
                                {opt}
                              </span>
                            ))}
                          </div>
                        )}
                        {q.explanation && (
                          <p className="mt-2 text-xs text-zinc-400 font-tiro">
                            <span className="text-amber-300 font-semibold">তথ্য: </span>{q.explanation}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setCurrentIndex(idx);
                          onClose();
                        }}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-tiro font-semibold text-white bg-white/15 hover:bg-white/25 transition-colors"
                      >
                        ডিসপ্লেতে যান
                      </button>

                      <button
                        onClick={() => handleMove(idx, -1)}
                        disabled={idx === 0}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white disabled:opacity-20"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleMove(idx, 1)}
                        disabled={idx === questions.length - 1}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white disabled:opacity-20"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleStartEdit(q)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-white"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(q.id)}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: ADD / EDIT SINGLE QUESTION */}
          {activeTab === 'add' && (
            <form onSubmit={handleSaveQuestion} className="space-y-5 max-w-2xl mx-auto">
              
              {/* Category Dropdown */}
              <div>
                <label className="block font-tiro text-sm text-amber-300 mb-1.5 font-semibold">
                  বিষয় / ক্যাটাগরি নির্বাচন করুন
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <select
                    value={isCustomCategory ? 'CUSTOM' : selectedCategory}
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM') {
                        setIsCustomCategory(true);
                      } else {
                        setIsCustomCategory(false);
                        setSelectedCategory(e.target.value);
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white font-tiro focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {PREDEFINED_CATEGORIES.map((cat, idx) => (
                      <option key={idx} value={cat} className="bg-zinc-900 text-white">
                        {cat}
                      </option>
                    ))}
                    <option value="CUSTOM" className="bg-zinc-900 text-amber-300 font-semibold">
                      + অন্যান্য বিষয় লিখুন...
                    </option>
                  </select>

                  {isCustomCategory && (
                    <input
                      type="text"
                      required
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="কাস্টম ক্যাটাগরি লিখুন..."
                      className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-amber-400/40 text-amber-200 font-tiro focus:outline-none focus:border-amber-400"
                    />
                  )}
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block font-tiro text-sm text-zinc-200 mb-1.5 font-semibold">
                  প্রশ্ন লিখুন <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder="যেমন: বাংলাদেশের সংবিধান কোন তারিখে কার্যকর হয়?"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-tiro text-lg focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
                />
              </div>

              {/* 4 Dedicated Option Boxes */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block font-tiro text-sm text-cyan-300 font-semibold">
                    ৪টি অপশনসমূহ (ক, খ, গ, ঘ)
                  </label>
                  <span className="text-xs text-zinc-400 font-tiro">
                    * যেকোনো অপশনের পাশে ক্লিক করে সঠিক উত্তর বানাতে পারেন
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-tiro">
                  {/* Option 1 */}
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-cyan-500/20">
                    <span className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      ক
                    </span>
                    <input
                      type="text"
                      value={opt1}
                      onChange={(e) => setOpt1(e.target.value)}
                      placeholder="১ম অপশন লিখুন"
                      className="w-full bg-transparent text-white text-sm focus:outline-none"
                    />
                    {opt1 && (
                      <button
                        type="button"
                        onClick={() => setAnswerText(opt1)}
                        className="text-[11px] px-2 py-0.5 rounded bg-white/10 hover:bg-emerald-500/30 text-zinc-300 hover:text-emerald-300 flex-shrink-0"
                        title="এই অপশনটিকে উত্তর হিসেবে সেট করুন"
                      >
                        উত্তর
                      </button>
                    )}
                  </div>

                  {/* Option 2 */}
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-purple-500/20">
                    <span className="w-7 h-7 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      খ
                    </span>
                    <input
                      type="text"
                      value={opt2}
                      onChange={(e) => setOpt2(e.target.value)}
                      placeholder="২য় অপশন লিখুন"
                      className="w-full bg-transparent text-white text-sm focus:outline-none"
                    />
                    {opt2 && (
                      <button
                        type="button"
                        onClick={() => setAnswerText(opt2)}
                        className="text-[11px] px-2 py-0.5 rounded bg-white/10 hover:bg-emerald-500/30 text-zinc-300 hover:text-emerald-300 flex-shrink-0"
                        title="এই অপশনটিকে উত্তর হিসেবে সেট করুন"
                      >
                        উত্তর
                      </button>
                    )}
                  </div>

                  {/* Option 3 */}
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-amber-500/20">
                    <span className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      গ
                    </span>
                    <input
                      type="text"
                      value={opt3}
                      onChange={(e) => setOpt3(e.target.value)}
                      placeholder="৩য় অপশন লিখুন"
                      className="w-full bg-transparent text-white text-sm focus:outline-none"
                    />
                    {opt3 && (
                      <button
                        type="button"
                        onClick={() => setAnswerText(opt3)}
                        className="text-[11px] px-2 py-0.5 rounded bg-white/10 hover:bg-emerald-500/30 text-zinc-300 hover:text-emerald-300 flex-shrink-0"
                        title="এই অপশনটিকে উত্তর হিসেবে সেট করুন"
                      >
                        উত্তর
                      </button>
                    )}
                  </div>

                  {/* Option 4 */}
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-emerald-500/20">
                    <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold text-sm flex-shrink-0">
                      ঘ
                    </span>
                    <input
                      type="text"
                      value={opt4}
                      onChange={(e) => setOpt4(e.target.value)}
                      placeholder="৪র্থ অপশন লিখুন"
                      className="w-full bg-transparent text-white text-sm focus:outline-none"
                    />
                    {opt4 && (
                      <button
                        type="button"
                        onClick={() => setAnswerText(opt4)}
                        className="text-[11px] px-2 py-0.5 rounded bg-white/10 hover:bg-emerald-500/30 text-zinc-300 hover:text-emerald-300 flex-shrink-0"
                        title="এই অপশনটিকে উত্তর হিসেবে সেট করুন"
                      >
                        উত্তর
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Correct Answer Input */}
              <div>
                <label className="block font-tiro text-sm text-emerald-400 mb-1.5 font-semibold">
                  সঠিক উত্তর লিখুন <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={answerText}
                  onChange={(e) => setAnswerText(e.target.value)}
                  placeholder="যেমন: ১৬ ডিসেম্বর ১৯৭২ (বা উপরের অপশনের উত্তর বাটনে ক্লিক করুন)"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/10 border border-emerald-500/40 text-emerald-200 font-tiro text-lg font-bold focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400"
                />
              </div>

              {/* Additional Information / Explanation */}
              <div>
                <label className="block font-tiro text-sm text-amber-300 mb-1.5 font-semibold">
                  অতিরিক্ত ব্যাখ্যা বা তথ্য (ডিসপ্লে কার্ডের নির্দিষ্ট স্থানে দেখাবে)
                </label>
                <textarea
                  rows={2}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="যেমন: ১৯৭২ সালের ৪ নভেম্বর এটি গণপরিষদে গৃহীত হয় এবং ১৬ ডিসেম্বর থেকে আনুষ্ঠানিকভাবে কার্যকর হয়।"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/15 text-white font-tiro focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="apple-btn-secondary px-5 py-2.5 rounded-xl font-tiro text-zinc-300"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="apple-btn px-6 py-2.5 rounded-xl font-tiro font-bold text-white shadow-lg"
                >
                  {editingId ? 'আপডেট করুন' : 'প্রশ্ন সেভ করুন'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: BULK IMPORT */}
          {activeTab === 'bulk' && (
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="p-4 rounded-2xl bg-white/5 border border-white/15 font-tiro text-sm text-zinc-300">
                <p className="font-bold text-white mb-1">দ্রুত বাল্ক ইমপোর্ট করার নিয়ম:</p>
                <p className="text-xs text-zinc-400 mb-2">
                  নিচের টেক্সটবক্সে প্রশ্নগুলো কপি-পেস্ট করুন। প্রতিটি প্রশ্নের মাঝে <code className="bg-white/10 px-1 py-0.5 rounded text-white">---</code> দিন।
                </p>
                <pre className="bg-black/60 p-2.5 rounded-xl text-xs text-zinc-300 overflow-x-auto select-all">
{`প্রশ্ন: বাংলাদেশের সংবিধান কোন তারিখে কার্যকর হয়?
উত্তর: ১৬ ডিসেম্বর ১৯৭২
বিষয়: বাংলাদেশ বিষয়াবলী
অপশন: ৪ নভেম্বর ১৯৭২, ১৬ ডিসেম্বর ১৯৭২, ২৬ মার্চ ১৯৭১, ১০ জানুয়ারি ১৯৭২
ব্যাখ্যা: ১৯৭২ সালের ৪ নভেম্বর এটি গণপরিষদে পাস হয়।
---
প্রশ্ন: ইন্টারনেটের জনক বা WWW এর উদ্ভাবক কে?
উত্তর: টিম বার্নার্স-লি
বিষয়: তথ্য ও যোগাযোগ প্রযুক্তি`}
                </pre>
              </div>

              <textarea
                rows={9}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                placeholder="এখানে আপনার প্রশ্নগুলো পেস্ট করুন..."
                className="w-full p-4 rounded-2xl bg-white/5 border border-white/15 text-white font-tiro text-base focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
              />

              {bulkSuccessMsg && (
                <div className="p-3 rounded-xl bg-white/20 border border-white/40 text-white font-tiro text-center font-bold">
                  {bulkSuccessMsg}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setBulkText('')}
                  className="apple-btn-secondary px-4 py-2 rounded-xl font-tiro text-sm text-zinc-400"
                >
                  ক্লিয়ার
                </button>
                <button
                  type="button"
                  onClick={handleBulkImport}
                  className="apple-btn px-6 py-2.5 rounded-xl font-tiro font-bold text-white flex items-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  প্রশ্নসমূহ ইমপোর্ট করুন
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}
