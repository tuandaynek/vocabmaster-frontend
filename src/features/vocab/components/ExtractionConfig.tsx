import { type KeyboardEvent, useState } from "react";
import { Search, X } from "lucide-react";
import type { FocusMode } from "../types";
import { FOCUS_MODES, LIMIT_OPTIONS } from "../constants/extractorConstants";

interface ExtractionConfigProps {
  focusMode: FocusMode;
  limit: number;
  mustIncludeWords: string[];
  onFocusModeChange: (mode: FocusMode) => void;
  onLimitChange: (value: number) => void;
  onMustIncludeWordsChange: (words: string[]) => void;
}

export function ExtractionConfig({
  focusMode,
  limit,
  mustIncludeWords,
  onFocusModeChange,
  onLimitChange,
  onMustIncludeWordsChange,
}: ExtractionConfigProps) {
  const [input, setInput] = useState("");

  const addWord = () => {
    const word = input.trim().replace(/,$/, "");
    if (word && !mustIncludeWords.includes(word)) {
      onMustIncludeWordsChange([...mustIncludeWords, word]);
    }
    setInput("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addWord();
    }
  };

  return (
  <aside className="rounded-3xl border border-slate-800 bg-slate-900 p-5 shadow-xl sm:p-6 space-y-6">
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shadow-inner">
        <Search className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-indigo-400">
          Settings
        </p>
        <h2 className="font-bold text-white">Cấu hình trích xuất</h2>
      </div>
    </div>

    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Chế độ lọc</p>
      <div className="space-y-2.5">
        {FOCUS_MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            onClick={() => onFocusModeChange(mode.value)}
            className={`w-full rounded-2xl border p-3.5 text-left transition ${
              focusMode === mode.value
                ? "border-indigo-500/80 bg-indigo-950/30 text-white shadow-lg shadow-indigo-500/10"
                : "border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700 hover:bg-slate-950"
            }`}
          >
            <span className="block text-sm font-bold text-white">{mode.value}</span>
            <span className="mt-0.5 block text-xs text-slate-400">{mode.description}</span>
          </button>
        ))}
      </div>
    </div>

    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Số lượng từ tối đa</p>
      <div className="flex gap-2">
        {LIMIT_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onLimitChange(option)}
            className={`flex-1 rounded-2xl border px-3 py-2.5 text-xs font-bold transition ${
              limit === option
                ? "border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700 hover:bg-slate-950"
            }`}
          >
            {option} từ
          </button>
        ))}
      </div>
    </div>

    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400" htmlFor="must-include">
        Từ bắt buộc ưu tiên
      </label>
      <div className="flex min-h-12 flex-wrap items-center gap-2 rounded-2xl border border-slate-800 bg-slate-950 p-2.5 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20">
        {mustIncludeWords.map((word) => (
          <span
            key={word}
            className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300"
          >
            {word}
            <button
              type="button"
              onClick={() =>
                onMustIncludeWordsChange(mustIncludeWords.filter((item) => item !== word))
              }
              aria-label={`Xóa ${word}`}
              className="hover:text-white"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <input
          id="must-include"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addWord}
          placeholder={mustIncludeWords.length ? "Thêm từ..." : "Gõ từ và nhấn Enter"}
          className="min-w-[130px] flex-1 bg-transparent px-1 py-1 text-sm text-slate-200 outline-none placeholder:text-slate-500"
        />
      </div>
      <p className="mt-2 text-xs text-slate-500">Nhấn Enter hoặc dấu phẩy để thêm tag</p>
    </div>
  </aside>
);
}