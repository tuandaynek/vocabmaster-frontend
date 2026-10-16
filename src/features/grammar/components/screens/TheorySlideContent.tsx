import {
  CheckCircle2,
  Lightbulb,
  ListChecks,
  Sparkles,
  TriangleAlert,
  Volume2,
} from 'lucide-react';
import type { TheorySlideCategory } from '../../constants/theoryConstants';
import type { SubTopic } from '../../types/grammarData';

interface TheorySlideContentProps {
  category: TheorySlideCategory;
  subTopic: SubTopic;
  speakingExample: number | null;
  speechError: string | null;
  onSpeakExample: (sentence: string, index: number) => void;
}

export default function TheorySlideContent({
  category,
  subTopic,
  speakingExample,
  speechError,
  onSpeakExample,
}: TheorySlideContentProps) {
  switch (category) {
    case 'formula':
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-black text-slate-800">
            <Lightbulb className="h-5 w-5 text-amber-500" /> Tách nhỏ cấu trúc
          </div>
          {subTopic.theory.formulas.map((formula, index) => (
            <article key={`${formula.tag}-${index}`} className="overflow-hidden rounded-3xl border-2 border-indigo-100 bg-white shadow-lg shadow-indigo-100/40">
              <div className="flex items-center gap-3 bg-indigo-50/80 px-4 py-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500 text-sm font-black text-white shadow-md">
                  {index + 1}
                </span>
                <h2 className="font-black text-indigo-900">{formula.tag}</h2>
              </div>
              <div className="space-y-3 p-4 md:p-5">
                <p className="rounded-2xl border border-indigo-100 bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-4 font-mono text-sm font-black leading-relaxed text-indigo-950 md:text-base">
                  {formula.structure}
                </p>
                <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-sm font-medium leading-relaxed text-amber-950">
                  <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                  <p><span className="font-black">Ghi nhớ: </span>{formula.note}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      );
    case 'usage':
      return (
        <div className="space-y-5">
          <div className="flex items-center gap-2 text-lg font-black text-slate-800">
            <ListChecks className="h-5 w-5 text-sky-500" /> Khi nào mình dùng cấu trúc này?
          </div>
          <ol className="grid gap-3">
            {subTopic.theory.usageSignals.map((signal, index) => (
              <li key={signal} className="flex items-start gap-4 rounded-2xl border-2 border-sky-100 bg-gradient-to-r from-sky-50/80 to-white p-4 shadow-sm">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border-b-2 border-sky-600 bg-sky-500 font-black text-white shadow-md">
                  {index + 1}
                </span>
                <span className="pt-1.5 text-sm font-bold leading-relaxed text-slate-700 md:text-base">{signal}</span>
              </li>
            ))}
          </ol>
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50 p-4 text-sm font-medium text-amber-900">
            <p className="flex items-center gap-2 font-black"><Sparkles className="h-4 w-4 text-amber-600" /> Mẹo nhỏ</p>
            <p className="mt-1">Hãy tìm dấu hiệu thời gian và xác định chủ ngữ trước khi chọn công thức.</p>
          </div>
        </div>
      );
    case 'examples':
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-black text-slate-800">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" /> Đọc câu, hiểu lý do
          </div>
          {subTopic.theory.examples.map((example, index) => (
            <article key={`${example.sentence}-${index}`} className="rounded-3xl border-2 border-emerald-100 bg-gradient-to-br from-emerald-50/80 to-white p-4 shadow-md shadow-emerald-100/60 md:p-5">
              <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600">Ví dụ {index + 1}</span>
              <div className="mt-2 flex items-start justify-between gap-3">
                <p className="text-base font-black leading-relaxed text-emerald-950 md:text-lg">{example.sentence}</p>
                <button
                  type="button"
                  aria-label={`${speakingExample === index ? 'Dừng' : 'Nghe'} phát âm: ${example.sentence}`}
                  aria-pressed={speakingExample === index}
                  onClick={() => onSpeakExample(example.sentence, index)}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border-b-4 border-sky-700 bg-sky-500 text-white shadow-md shadow-sky-100 transition hover:bg-sky-600 active:translate-y-1 active:border-b-0 ${
                    speakingExample === index ? 'animate-pulse ring-4 ring-sky-200' : ''
                  }`}
                >
                  <Volume2 className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-1 text-sm font-medium text-slate-600">{example.translation}</p>
              <div className="mt-4 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-3.5 text-sm font-medium leading-relaxed text-amber-950">
                <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p><span className="font-black">Vì sao dùng? </span>{example.note}</p>
              </div>
            </article>
          ))}
          {speechError && <p role="status" className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-bold text-rose-700">{speechError}</p>}
        </div>
      );
    case 'traps':
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-black text-slate-800">
            <TriangleAlert className="h-5 w-5 text-rose-500" /> Nhận diện và né bẫy
          </div>
          {subTopic.theory.traps.map((trap, index) => (
            <article key={`${trap.wrong}-${index}`} className="space-y-3 rounded-3xl border-2 border-slate-100 bg-white p-4 shadow-md md:p-5">
              <div className="rounded-2xl border-2 border-rose-100 bg-rose-50 p-3.5">
                <p className="mb-1 text-[11px] font-black uppercase tracking-wider text-rose-500">Bẫy sai</p>
                <p className="font-bold leading-relaxed text-rose-800">{trap.wrong}</p>
              </div>
              <div className="rounded-2xl border-2 border-emerald-100 bg-emerald-50 p-3.5">
                <p className="mb-1 text-[11px] font-black uppercase tracking-wider text-emerald-600">Đáp án đúng</p>
                <p className="font-black leading-relaxed text-emerald-900">{trap.correct}</p>
              </div>
              <p className="px-1 text-sm font-medium leading-relaxed text-slate-600">
                <span className="font-black text-slate-800">Vì sao dễ nhầm? </span>{trap.explanation}
              </p>
            </article>
          ))}
        </div>
      );
    default:
      throw new Error('Unsupported theory slide category.');
  }
}
