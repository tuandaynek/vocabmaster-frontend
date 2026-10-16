import { getCleanWords, isWordInCollocation } from "../utils/collocationUtils";

interface SentencePronunciationFeedbackProps {
  sentence: string;
  targetPhrase: string;
  spokenText: string;
}

export default function SentencePronunciationFeedback({
  sentence,
  targetPhrase,
  spokenText,
}: SentencePronunciationFeedbackProps) {
  const rawWords = sentence.split(/\s+/);
  const targetWordsClean = getCleanWords(sentence);
  const spokenWordsClean = spokenText ? getCleanWords(spokenText) : [];

  return (
    <div className="my-2 flex min-h-[80px] flex-wrap items-center justify-center gap-2 leading-relaxed">
      {rawWords.map((word, index) => {
        const cleanWord = targetWordsClean[index];
        const spokenWord = spokenWordsClean[index];
        const isTargetCollocation = isWordInCollocation(
          index,
          sentence,
          targetPhrase,
        );

        if (!spokenText) {
          return (
            <span
              key={index}
              className={`rounded-2xl border-2 px-3 py-1.5 text-lg font-bold transition-all ${
                isTargetCollocation
                  ? "border-amber-300 bg-amber-50 text-amber-800"
                  : "border-slate-200 bg-white text-slate-700"
              }`}
            >
              {word}
            </span>
          );
        }

        const isCorrect = spokenWord === cleanWord;
        const isMissing = !spokenWord;

        return (
          <div key={index} className="flex flex-col items-center">
            <span
              className={`rounded-2xl border-2 px-3 py-1.5 text-lg font-bold transition-all ${
                isCorrect
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-rose-200 bg-rose-50 text-rose-700"
              }`}
            >
              {word}
            </span>
            {!isCorrect && (
              <span className="mt-1.5 rounded-xl border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700 shadow-sm">
                {isMissing ? "thiếu" : `≠ "${spokenWord}"`}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
