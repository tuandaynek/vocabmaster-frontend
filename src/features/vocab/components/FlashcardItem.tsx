import { BookOpen, Layers } from "lucide-react";
import { AudioButton } from "@/components/function/AudioButton";
import { playWordAudio } from "@/components/function/audioUtils";
import { useEffect } from "react";
import type { UserVocabularyItem } from "../types";

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
      onClick={submitting ? undefined : onFlip}
      className="group relative h-[450px] w-full cursor-pointer [perspective:1000px]"
    >
      <div
        className={`relative h-full w-full rounded-3xl border-2 border-slate-100 bg-white shadow-sm transition-transform duration-500 [transform-style:preserve-3d] hover:border-emerald-200 ${
          isFlipped ? "[transform:rotateY(180deg)]" : ""
        }`}
      >
        {/* --- MẶT TRƯỚC (Từ vựng) --- */}
        <div className="absolute inset-0 flex flex-col justify-between rounded-3xl bg-white p-6 [backface-visibility:hidden] [transform:rotateY(0deg)] sm:p-8">
          <div className="flex items-center justify-between">
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-800">
              Mặt Trước (Từ vựng)
            </span>
            <span className="text-right text-xs font-medium text-slate-500">
              Bấm vào thẻ hoặc Space để lật
            </span>
          </div>

          <div className="my-auto space-y-5 text-center">
            <div className="flex items-center justify-center gap-3">
              <h2 className="text-4xl font-extrabold tracking-tight text-slate-800 sm:text-5xl">
                {currentWord?.word || "Unknown word"}
              </h2>
              {currentWord?.word && (
                <div onClick={(e) => e.stopPropagation()}>
                  <AudioButton
                    text={currentWord.word}
                    audioUrl={currentWord.audio_url}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-sky-300 hover:bg-sky-50 hover:text-sky-700"
                  />
                </div>
              )}
            </div>

            <div className="flex justify-center gap-2.5">
              {currentWord?.pos && (
                <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-700">
                  {currentWord.pos}
                </span>
              )}
              {currentWord?.ipa && (
                <span className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-800">
                  {currentWord.ipa}
                </span>
              )}
            </div>
          </div>

          <div className="text-center text-xs font-semibold uppercase tracking-wider text-slate-500">
            Xem mặt sau để kiểm tra nghĩa & ngữ cảnh
          </div>
        </div>

        {/* --- MẶT SAU (Nghĩa & Ngữ cảnh) --- */}
        <div className="absolute inset-0 flex flex-col justify-between overflow-y-auto rounded-3xl bg-white p-6 [backface-visibility:hidden] [transform:rotateY(180deg)] sm:p-8">
          <div>
            <div className="mb-4 flex items-center justify-between">
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                Mặt Sau (Nghĩa & Ngữ cảnh)
              </span>
              <span className="text-xs font-semibold text-slate-500">
                Phím 1-4 để chọn mức độ
              </span>
            </div>

            <div className="space-y-4">
              {/* Nghĩa tiếng Việt */}
              <div>
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Nghĩa tiếng Việt
                </p>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xl font-extrabold text-slate-800">
                    {currentWord?.meaning || "Chưa cập nhật nghĩa"}
                  </p>
                </div>
              </div>

              {/* Ngữ cảnh bài học */}
              {card.context_sentence && (
                <div>
                  <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Ngữ cảnh bài học
                  </p>
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3.5 text-sm italic text-slate-600">
                    &ldquo;{card.context_sentence}&rdquo;
                  </div>
                </div>
              )}

              {/* Collocations */}
              {collocations.length > 0 && (
                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <BookOpen className="h-3.5 w-3.5 text-sky-600" /> Collocations
                  </p>
                  <div className="space-y-1">
                    {collocations.slice(0, 2).map((col, idx) => (
                      <div key={idx} className="text-xs text-slate-600">
                        <span className="font-bold text-slate-800">{col.phrase}</span>:{" "}
                        <span className="text-slate-500">{col.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Họ từ (Word Family) */}
              {wordFamily.length > 0 && (
                <div>
                  <p className="mb-1.5 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <Layers className="h-3.5 w-3.5 text-emerald-600" /> Họ từ
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {wordFamily.slice(0, 4).map((wf, idx) => (
                      <span
                        key={idx}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600"
                      >
                        <strong className="text-slate-800">{wf.word}</strong>{" "}
                        <span className="text-slate-500">({wf.pos})</span>
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