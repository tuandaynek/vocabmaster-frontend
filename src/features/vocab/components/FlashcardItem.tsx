import { BookOpen, Layers } from "lucide-react";
import type { UserVocabularyItem } from "@/features/vocab/types";
import { AudioButton, playWordAudio } from "@/components/function/AudioButton";
import { useEffect } from "react";

interface FlashcardItemProps {
  card: UserVocabularyItem;
  isFlipped: boolean;
  onFlip: () => void;
  submitting: boolean;
}

export function FlashcardItem({
  card,
  isFlipped,
  onFlip,
  submitting,
}: FlashcardItemProps) {
  const currentWord = card.global_words;
  const collocations = Array.isArray(currentWord?.collocations)
    ? currentWord.collocations
    : [];
  const wordFamily = Array.isArray(currentWord?.word_family)
    ? currentWord.word_family
    : [];

  useEffect(() => {
    if (currentWord?.word) {
      playWordAudio(currentWord.word, currentWord.audio_url);
    }
  }, [card.id, currentWord?.word, currentWord?.audio_url]);

  return (
    <div
      onClick={onFlip}
      className="group relative h-[450px] w-full cursor-pointer [perspective:1000px]"
    >
      <div
        className={`relative h-full w-full rounded-[32px] border border-slate-800 bg-slate-900 shadow-2xl transition-transform duration-500 [transform-style:preserve-3d] hover:border-slate-700 ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* --- MẶT TRƯỚC (Từ vựng) --- */}
        <div className="absolute inset-0 flex flex-col justify-between p-8 [backface-visibility:hidden] [transform:rotateY(0deg)]">
          <div className="flex items-center justify-between">
            <span className="rounded-xl bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-indigo-400">
              Mặt Trước (Từ vựng)
            </span>
            <span className="text-xs font-medium text-slate-400">
              Bấm vào thẻ hoặc Space để lật
            </span>
          </div>

          <div className="my-auto space-y-5 text-center">
            <div className="flex items-center justify-center gap-3">
              <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl">
                {currentWord?.word || "Unknown word"}
              </h2>
              {currentWord?.word && (
                <div onClick={(e) => e.stopPropagation()}>
                  <AudioButton
                    text={currentWord.word}
                    audioUrl={currentWord.audio_url}
                  />
                </div>
              )}
            </div>

            <div className="flex justify-center gap-2.5">
              {currentWord?.pos && (
                <span className="rounded-xl bg-slate-800 border border-slate-700 px-3 py-1 text-sm font-semibold text-slate-300">
                  {currentWord.pos}
                </span>
              )}
              {currentWord?.ipa && (
                <span className="rounded-xl bg-violet-500/10 border border-violet-500/20 px-3 py-1 text-sm font-semibold text-violet-400">
                  {currentWord.ipa}
                </span>
              )}
            </div>
          </div>

          <div className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400">
            Xem mặt sau để kiểm tra nghĩa & ngữ cảnh
          </div>
        </div>

        {/* --- MẶT SAU (Nghĩa & Ngữ cảnh) --- */}
        <div className="absolute inset-0 flex flex-col justify-between overflow-y-auto p-8 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-400">
                Mặt Sau (Nghĩa & Ngữ cảnh)
              </span>
              <span className="text-xs font-semibold text-slate-400">
                Phím 1-4 để chọn mức độ
              </span>
            </div>

            <div className="space-y-4">
              {/* Nghĩa tiếng Việt */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                  Nghĩa tiếng Việt
                </p>
                <div className="rounded-2xl border border-violet-500/20 bg-violet-950/40 p-4 shadow-inner">
                  <p className="text-xl font-black text-white">
                    {currentWord?.meaning || "Chưa cập nhật nghĩa"}
                  </p>
                </div>
              </div>

              {/* Ngữ cảnh bài học */}
              {card.context_sentence && (
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                    Ngữ cảnh bài học
                  </p>
                  <div className="rounded-2xl border border-slate-800 bg-slate-800/50 p-3.5 text-sm italic text-slate-300">
                    &ldquo;{card.context_sentence}&rdquo;
                  </div>
                </div>
              )}

              {/* Collocations */}
              {collocations.length > 0 && (
                <div>
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-indigo-400" /> Collocations
                  </p>
                  <div className="space-y-1">
                    {collocations.slice(0, 2).map((col: any, idx: number) => (
                      <div key={idx} className="text-xs text-slate-300">
                        <span className="font-bold text-white">{col.phrase}</span>:{" "}
                        <span className="text-slate-400">{col.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Họ từ (Word Family) */}
              {wordFamily.length > 0 && (
                <div>
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    <Layers className="h-3.5 w-3.5 text-emerald-400" /> Họ từ
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {wordFamily.slice(0, 4).map((wf: any, idx: number) => (
                      <span
                        key={idx}
                        className="rounded-xl border border-slate-800 bg-slate-800/60 px-2.5 py-1 text-xs text-slate-300"
                      >
                        <strong className="text-white">{wf.word}</strong>{" "}
                        <span className="text-slate-400">({wf.pos})</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}