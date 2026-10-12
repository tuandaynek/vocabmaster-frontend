import { type ChangeEvent, useState } from "react";
import { Clipboard, Loader2, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SAMPLE_PASSAGES } from "../constants/extractorConstants";

interface PassageEditorProps {
  passageText: string;
  loading: boolean;
  onChange: (value: string) => void;
  onExtract: () => void;
}

export function PassageEditor({
  passageText,
  loading,
  onChange,
  onExtract,
}: PassageEditorProps) {
  const [sample, setSample] = useState("");

  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      onChange(text);
    } catch {
      toast.error("Không thể đọc clipboard. Hãy kiểm tra quyền truy cập trình duyệt.");
    }
  };

  const selectSample = (value: string) => {
    setSample(value);
    if (value && SAMPLE_PASSAGES[value]) {
      onChange(SAMPLE_PASSAGES[value]);
    }
  };

  return (
  <section className="rounded-3xl border-2 border-slate-100 bg-white p-5 shadow-sm sm:p-6">
    <div className="mb-4 flex items-start justify-between gap-4">
      <div>
        <p className="mb-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
          Input passage
        </p>
        <h2 className="text-lg font-extrabold text-slate-800">Dán nội dung cần phân tích</h2>
      </div>
      <span className="hidden rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 sm:block">
        AI Deep-Dive
      </span>
    </div>

    <div className="mb-3 flex flex-wrap items-center gap-1 rounded-2xl border-2 border-slate-100 bg-slate-50 p-1.5">
      <button
        type="button"
        onClick={pasteFromClipboard}
        disabled={loading}
        className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-sky-50 hover:text-sky-700 disabled:opacity-50"
      >
        <Clipboard className="h-3.5 w-3.5" />
        Paste from Clipboard
      </button>
      <button
        type="button"
        onClick={() => onChange("")}
        disabled={loading || !passageText}
        className="inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-rose-50 hover:text-rose-700 disabled:opacity-50"
      >
        <Trash2 className="h-3.5 w-3.5" />
        Clear Text
      </button>
      <select
        aria-label="Chọn đoạn văn mẫu"
        value={sample}
        onChange={(e) => selectSample(e.target.value)}
        className="ml-auto max-w-full cursor-pointer rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
      >
        <option value="">Chọn đoạn văn mẫu</option>
        {Object.keys(SAMPLE_PASSAGES).map((name) => (
          <option key={name} value={name}>
            {name}
          </option>
        ))}
      </select>
    </div>

    <textarea
      value={passageText}
      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
      disabled={loading}
      placeholder="Dán đoạn văn tiếng Anh ở đây..."
      className="min-h-[250px] w-full resize-y rounded-2xl border-2 border-slate-200 bg-white p-4 text-sm leading-7 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 disabled:bg-slate-50 disabled:opacity-60"
    />
    <div className="mt-2.5 flex justify-between text-xs font-medium text-slate-500">
      <span>
        {passageText.trim()
          ? `${passageText.trim().split(/\s+/).length} từ`
          : "Sẵn sàng phân tích"}
      </span>
      <span>English passage</span>
    </div>

    <Button
      type="button"
      onClick={onExtract}
      disabled={loading || !passageText.trim()}
      className="mt-6 h-12 w-full rounded-2xl border-b-4 border-emerald-700 bg-emerald-500 text-sm font-bold text-white shadow-sm transition-all duration-150 hover:bg-emerald-600 active:translate-y-1 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
      {loading ? "Đang phân tích..." : "Trích Xuất Từ Vựng Deep-Dive"}
    </Button>
  </section>
);
}