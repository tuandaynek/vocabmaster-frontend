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
  <article className={`rounded-3xl border-2 bg-white p-6 shadow-sm transition-all duration-200 ${
    item.selected
      ? "border-emerald-300"
      : "border-slate-100 hover:border-emerald-200 hover:shadow-md"
  }`}>
    <div className="flex items-start gap-4">
      <input
        type="checkbox"
        checked={item.selected}
        onChange={onToggle}
        aria-label={`Chọn ${item.word}`}
        className="mt-1.5 h-4 w-4 cursor-pointer rounded border-slate-300 bg-white text-emerald-600 focus:ring-emerald-500"
      />
      
      <div className="min-w-0 flex-1">
        {/* Title, Meaning & IPA */}
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="text-xl font-extrabold tracking-tight text-slate-800">{item.word}</h3>
          {item.ipa && (
            <span className="text-sm font-semibold text-slate-500">
              {item.ipa}
            </span>
          )}
          {item.pos && (
            <span className="rounded-xl border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-800">
              {item.pos}
            </span>
          )}
        </div>

        {/* Nghĩa tiếng Việt */}
        {item.meaning && (
          <p className="mt-1.5 text-sm font-bold text-emerald-700">
            {item.meaning}
          </p>
        )}

        {/* Context Sentence */}
        {item.context_sentence && (
          <p className="mt-3 rounded-2xl border-l-4 border-sky-300 bg-sky-50 p-3 text-sm italic leading-relaxed text-slate-600">
            &ldquo;{item.context_sentence}&rdquo;
          </p>
        )}

        {/* Metadata Grid (Word Family & Prefix/Suffix) */}
        <div className="mt-4 grid gap-3 border-t-2 border-slate-100 pt-3.5 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Word family
            </p>
            <p className="mt-1 text-xs font-medium text-slate-600">
              {renderWordFamily()}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Prefix / Suffix
            </p>
            <p className="mt-1 text-xs font-medium text-slate-600">
              {renderAffix()}
            </p>
          </div>
        </div>

        {/* Usage Note */}
        {item.usage_note && (
          <div className="mt-3.5 rounded-2xl border border-amber-200 bg-amber-50 p-3.5">
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-amber-800">
              Usage note
            </p>
            <p className="text-xs leading-relaxed text-slate-700">
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