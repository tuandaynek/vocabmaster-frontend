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
      className="group relative h-[420px] w-full cursor-pointer [perspective:1000px]"
    >
      <div
        className={`relative h-full w-full rounded-[28px] border border-slate-200 bg-white p-6 shadow-lg transition-transform duration-300 [transform-style:preserve-3d] ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* --- MẶT TRƯỚC (Từ vựng) --- */}
        <div className="absolute inset-0 flex flex-col justify-between p-6 [backface-visibility:hidden] [transform:rotateY(0deg)]">
          <div className="flex items-center justify-between">
            <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-violet-700">
              Mặt Trước (Từ)
            </span>
            <span className="text-lg text-slate-400">
              Bấm vào thẻ hoặc Space để lật
            </span>
          </div>

          <div className="my-auto space-y-4 text-center">
            <div className="flex items-center justify-center gap-3">
              <h2 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
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

            <div className="flex justify-center gap-2">
              {currentWord?.pos && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-700">
                  {currentWord.pos}
                </span>
              )}
              {currentWord?.ipa && (
                <span className="rounded-full bg-violet-50 px-3 py-1 text-sm font-medium text-violet-700">
                  /{currentWord.ipa}/
                </span>
              )}
            </div>
          </div>

          <div className="text-center text-lg text-slate-400">
            Xem mặt sau để kiểm tra nghĩa & ví dụ
          </div>
        </div>

        {/* --- MẶT SAU (Nghĩa & Ngữ cảnh) --- */}
        <div className="absolute inset-0 flex flex-col justify-between overflow-y-auto p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Mặt Sau (Nghĩa)
              </span>
              <span className="text-sm text-slate-400">
                Phím 1-4 để chọn mức độ
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                  Nghĩa tiếng Việt
                </p>
                <div className="mt-1 rounded-2xl border border-violet-100 bg-violet-50/50 p-3.5">
                  <p className="text-xl font-bold text-violet-950">
                    {currentWord?.meaning || "Chưa cập nhật nghĩa"}
                  </p>
                </div>
              </div>

              {card.context_sentence && (
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-slate-400">
                    Ngữ cảnh bài học
                  </p>
                  <div className="mt-1 rounded-xl bg-slate-100 p-2.5 text-base italic text-slate-700">
                    "{card.context_sentence}"
                  </div>
                </div>
              )}

              {collocations.length > 0 && (
                <div>
                  <p className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wider text-slate-400">
                    <BookOpen className="h-3 w-3" /> Collocations
                  </p>
                  <div className="mt-1 space-y-1">
                    {collocations.slice(0, 2).map((col: any, idx: number) => (
                      <div key={idx} className="text-sm text-slate-700">
                        <span className="font-bold">{col.phrase}</span>:{" "}
                        {col.meaning}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {wordFamily.length > 0 && (
                <div>
                  <p className="flex items-center gap-1 text-sm font-semibold uppercase tracking-wider text-slate-400">
                    <Layers className="h-3 w-3" /> Họ từ
                  </p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {wordFamily.slice(0, 3).map((wf: any, idx: number) => (
                      <span
                        key={idx}
                        className="rounded bg-slate-100 px-2 py-0.5 text-sm text-slate-600"
                      >
                        <strong>{wf.word}</strong> ({wf.pos})
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
