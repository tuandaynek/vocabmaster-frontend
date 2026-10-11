import type { VocabListItem } from "../types";

interface WordResultCardProps {
  item: VocabListItem;
  index: number;
  onToggle: () => void;
}

export function WordResultCard({ item, index, onToggle }: WordResultCardProps) {
  // 1. Format Word Family thành chuỗi hiển thị
  const renderWordFamily = () => {
    if (!item.word_family || !Array.isArray(item.word_family) || item.word_family.length === 0) {
      return "Không có dữ liệu họ từ";
    }
    return item.word_family
      .map((wf) => `${wf.pos || "word"}: ${wf.word}`)
      .join(" · ");
  };

  // 2. Format Prefix / Suffix thành chuỗi hiển thị
  const renderAffix = () => {
    const ps = item.prefix_suffix;
    if (!ps) return "no affix";

    const parts = [];
    if (ps.prefix) parts.push(`Prefix: ${ps.prefix}`);
    if (ps.root) parts.push(`Root: ${ps.root}`);
    if (ps.suffix) parts.push(`Suffix: ${ps.suffix}`);

    return parts.length > 0 ? parts.join(" · ") : "no affix";
  };

  return (
  <article className={`rounded-3xl border p-6 transition-all duration-300 ${
    item.selected 
      ? "border-indigo-500/80 bg-indigo-950/20 shadow-xl shadow-indigo-500/10" 
      : "border-slate-800 bg-slate-900/40 hover:border-slate-700"
  }`}>
    <div className="flex items-start gap-4">
      <input
        type="checkbox"
        checked={item.selected}
        onChange={onToggle}
        aria-label={`Chọn ${item.word}`}
        className="mt-1.5 h-4 w-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
      />
      
      <div className="min-w-0 flex-1">
        {/* Title, Meaning & IPA */}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="text-xl font-black text-white tracking-tight">{item.word}</h3>
          {item.ipa && (
            <span className="text-sm font-semibold text-slate-400">
              {item.ipa}
            </span>
          )}
          {item.pos && (
            <span className="rounded-xl border border-slate-700/60 bg-slate-800/60 px-2.5 py-1 text-xs font-semibold text-slate-300">
              {item.pos}
            </span>
          )}
        </div>

        {/* Nghĩa tiếng Việt */}
        {item.meaning && (
          <p className="mt-1.5 text-sm font-bold text-emerald-400">
            {item.meaning}
          </p>
        )}

        {/* Context Sentence */}
        {item.context_sentence && (
          <p className="mt-3 text-sm leading-relaxed text-slate-300 italic bg-slate-800/40 p-3 rounded-2xl border-l-2 border-indigo-500">
            &ldquo;{item.context_sentence}&rdquo;
          </p>
        )}

        {/* Metadata Grid (Word Family & Prefix/Suffix) */}
        <div className="mt-4 grid gap-3 border-t border-slate-800 pt-3.5 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Word family
            </p>
            <p className="mt-1 text-xs text-slate-300 font-medium">
              {renderWordFamily()}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Prefix / Suffix
            </p>
            <p className="mt-1 text-xs text-slate-300 font-medium">
              {renderAffix()}
            </p>
          </div>
        </div>

        {/* Usage Note */}
        {item.usage_note && (
          <div className="mt-3.5 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-3.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 mb-1">
              Usage note
            </p>
            <p className="text-xs leading-relaxed text-slate-200">
              {item.usage_note}
            </p>
          </div>
        )}
      </div>

      {/* Index Badge */}
      <span className="text-xs font-bold text-slate-500 select-none">
        {String(index + 1).padStart(2, "0")}
      </span>
    </div>
  </article>
);
}