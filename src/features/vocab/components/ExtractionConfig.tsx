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
    <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
          <Search className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-indigo-600">
            Settings
          </p>
          <h2 className="font-semibold text-slate-900">Cấu hình trích xuất</h2>
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">Chế độ lọc</p>
        <div className="space-y-2">
          {FOCUS_MODES.map((mode) => (
            <button
              key={mode.value}
              type="button"
              onClick={() => onFocusModeChange(mode.value)}
              className={`w-full rounded-xl border p-3 text-left transition ${
                focusMode === mode.value
                  ? "border-indigo-300 bg-indigo-50 text-indigo-800 shadow-sm"
                  : "border-slate-200 bg-white text-slate-700 hover:border-indigo-200 hover:bg-slate-50"
              }`}
            >
              <span className="block text-sm font-semibold">{mode.value}</span>
              <span className="mt-0.5 block text-xs text-slate-500">{mode.description}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className="mb-2 text-sm font-medium text-slate-700">Số lượng từ tối đa</p>
        <div className="flex gap-2">
          {LIMIT_OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onLimitChange(option)}
              className={`flex-1 rounded-full border px-3 py-2 text-sm font-semibold transition ${
                limit === option
                  ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                  : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300"
              }`}
            >
              {option} từ
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="must-include">
          Từ bắt buộc ưu tiên
        </label>
        <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 p-2 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100">
          {mustIncludeWords.map((word) => (
            <span
              key={word}
              className="inline-flex items-center gap-1 rounded-full bg-indigo-100 px-2.5 py-1 text-xs font-medium text-indigo-700"
            >
              {word}
              <button
                type="button"
                onClick={() =>
                  onMustIncludeWordsChange(mustIncludeWords.filter((item) => item !== word))
                }
                aria-label={`Xóa ${word}`}
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
            className="min-w-[130px] flex-1 bg-transparent px-1 py-1 text-sm outline-none placeholder:text-slate-400"
          />
        </div>
        <p className="mt-2 text-xs text-slate-400">Nhấn Enter hoặc dấu phẩy để thêm tag</p>
      </div>
    </aside>
  );
}