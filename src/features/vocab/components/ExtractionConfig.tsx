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
  <aside className="space-y-6 rounded-3xl border-2 border-slate-100 bg-white p-5 shadow-sm sm:p-6">
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-200 bg-sky-50 text-sky-700">
        <Search className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-700">
          Settings
        </p>
        <h2 className="font-extrabold text-slate-800">Cấu hình trích xuất</h2>
      </div>
    </div>

    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Chế độ lọc</p>
      <div className="space-y-2.5">
        {FOCUS_MODES.map((mode) => (
          <button
            key={mode.value}
            type="button"
            onClick={() => onFocusModeChange(mode.value)}
            className={`w-full rounded-2xl border-2 p-3.5 text-left transition-all duration-150 ${
              focusMode === mode.value
                ? "border-emerald-300 bg-emerald-50 text-emerald-800 shadow-sm"
                : "border-slate-100 bg-white text-slate-700 hover:border-slate-200 hover:bg-slate-50"
            }`}
          >
            <span className="block text-sm font-bold text-slate-800">{mode.value}</span>
            <span className="mt-0.5 block text-xs text-slate-500">{mode.description}</span>
          </button>
        ))}
      </div>
    </div>

    <div>
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">Số lượng từ tối đa</p>
      <div className="flex gap-2">
        {LIMIT_OPTIONS.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onLimitChange(option)}
            className={`flex-1 rounded-2xl border-b-4 px-3 py-2.5 text-xs font-bold transition-all duration-150 active:translate-y-1 active:border-b-0 ${
              limit === option
                ? "border-amber-600 bg-amber-400 text-amber-950 shadow-sm hover:bg-amber-500"
                : "border-2 border-b-4 border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {option} từ
          </button>
        ))}
      </div>
    </div>

    <div>
      <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500" htmlFor="must-include">
        Từ bắt buộc ưu tiên
      </label>
      <div className="flex min-h-12 flex-wrap items-center gap-2 rounded-2xl border-2 border-slate-200 bg-slate-50 p-2.5 focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-100">
        {mustIncludeWords.map((word) => (
          <span
            key={word}
            className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800"
          >
            {word}
            <button
              type="button"
              onClick={() =>
                onMustIncludeWordsChange(mustIncludeWords.filter((item) => item !== word))
              }
              aria-label={`Xóa ${word}`}
              className="rounded-lg text-emerald-700 transition hover:text-rose-600"
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
          className="min-w-[130px] flex-1 bg-transparent px-1 py-1 text-sm text-slate-800 outline-none placeholder:text-slate-400"
        />
      </div>
      <p className="mt-2 text-xs text-slate-500">Nhấn Enter hoặc dấu phẩy để thêm tag</p>
    </div>
  </aside>
);
}