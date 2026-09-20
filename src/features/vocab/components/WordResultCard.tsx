import type { VocabListItem } from "../types";

interface WordResultCardProps {
  item: VocabListItem;
  index: number;
  onToggle: () => void;
}

export function WordResultCard({ item, index, onToggle }: WordResultCardProps) {
  const baseWord = item.word.split(/\s+/)[0];
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-indigo-200 hover:shadow-md">
      <div className="flex items-start gap-3">
        <input
          type="checkbox"
          checked={item.selected}
          onChange={onToggle}
          aria-label={`Chọn ${item.word}`}
          className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="text-xl font-bold text-indigo-700">{item.word}</h3>
            <span className="text-sm text-slate-400">
              /{baseWord === "mitigate" ? "ˈmɪtɪɡeɪt" : "ˈvɑːkæb"}/
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-600">{item.context_sentence}</p>
          <div className="mt-4 grid gap-3 border-t border-slate-100 pt-3 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Word family
              </p>
              <p className="mt-1 text-xs text-slate-600">
                N. {baseWord} · V. {baseWord} · Adj. {baseWord} · Adv. —
              </p>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Prefix / Suffix
              </p>
              <p className="mt-1 text-xs text-slate-600">
                <span className="font-semibold text-violet-600">Root</span> {baseWord} · no affix
              </p>
            </div>
          </div>
          <div className="mt-3 rounded-xl bg-indigo-50/70 p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-indigo-500">
              Usage note
            </p>
            <p className="mt-1 text-xs leading-5 text-indigo-900/75">
              Dùng trong ngữ cảnh học thuật để mô tả tác động, nguyên nhân hoặc sắc thái của vấn đề.
            </p>
          </div>
        </div>
        <span className="text-xs font-medium text-slate-300">0{index + 1}</span>
      </div>
    </article>
  );
}