import { MessageCircle, Send } from "lucide-react";
import { useTutorChat } from "../hooks/useTutorChat";
import { ChatMessageList } from "./ChatMessageList";

type WritingTutorChatProps = {
  questionText: string;
  onQuestionChange: (value: string) => void;
  targetBand: string;
  onTargetBandChange: (value: string) => void;
};

const QUICK_SUGGESTIONS = [
  "💡 Cho tui ý tưởng cho Body 1",
  "🔤 Cho tui xin Collocations chủ đề này",
  "⚠️ Đề này có bẫy gì không?",
];

export default function WritingTutorChat({
  questionText,
  onQuestionChange,
  targetBand,
  onTargetBandChange,
}: WritingTutorChatProps) {
  const { messages, draft, setDraft, sending, scrollRef, sendMessage } =
    useTutorChat({
      questionText,
      targetBand,
    });

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-3xl border-2 border-slate-100 bg-white shadow-sm">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b-2 border-slate-100 bg-emerald-50/50 px-5 py-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-2.5 text-emerald-700">
          <MessageCircle className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Socratic Writing Tutor
          </h2>
          <p className="text-[11px] text-slate-500">
            Hỏi từng bước · Tự xây dựng lập luận
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <label
            htmlFor="target-band"
            className="text-[10px] font-bold uppercase text-slate-500"
          >
            Target
          </label>
          <select
            id="target-band"
            value={targetBand}
            onChange={(e) => onTargetBandChange(e.target.value)}
            className="cursor-pointer rounded-xl border-2 border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-emerald-300"
          >
            {["6.0", "6.5", "7.0", "7.5", "8.0", "8.5", "9.0"].map((band) => (
              <option key={band} value={band}>
                Band {band}
              </option>
            ))}
          </select>
          <span
            className="h-2 w-2 rounded-full bg-emerald-400 shadow-sm"
            title="Tutor online"
          />
        </div>
      </div>

      {/* Task Prompt Input */}
      <div className="shrink-0 border-b-2 border-slate-100 bg-white p-4">
        <label
          htmlFor="tutor-question"
          className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-500"
        >
          Task 2 prompt
        </label>
        <textarea
          id="tutor-question"
          value={questionText}
          onChange={(e) => onQuestionChange(e.target.value)}
          rows={3}
          placeholder="Dán đề bài để Tutor hiểu đúng chủ đề..."
          className="w-full resize-none rounded-2xl border-2 border-slate-200 bg-white p-3 text-xs leading-relaxed text-slate-800 outline-none placeholder:text-slate-400 focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      {/* Message List Component */}
      <ChatMessageList
        messages={messages}
        sending={sending}
        scrollRef={scrollRef as unknown as React.RefObject<HTMLDivElement>}
      />

      {/* Chat Input & Suggestions */}
      <div className="shrink-0 border-t-2 border-slate-100 bg-slate-50 p-4">
        <div className="mb-2.5 flex gap-2 overflow-x-auto pb-1">
          {QUICK_SUGGESTIONS.map((suggestion) => (
            <button
              type="button"
              key={suggestion}
              onClick={() => void sendMessage(suggestion)}
              disabled={sending}
              className="whitespace-nowrap rounded-2xl border-2 border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 shadow-sm transition hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-2.5 rounded-2xl border-2 border-slate-200 bg-white p-2.5 focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-100">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void sendMessage();
              }
            }}
            rows={2}
            placeholder="Chia sẻ ý tưởng thô của bạn..."
            className="max-h-24 min-h-10 flex-1 resize-none bg-transparent px-2 py-1 text-xs text-slate-800 outline-none placeholder:text-slate-400"
            aria-label="Tin nhắn cho Writing Tutor"
          />
          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={!draft.trim() || sending}
            className="rounded-xl border-b-4 border-emerald-700 bg-emerald-500 p-2.5 text-white shadow-sm transition-all duration-150 hover:bg-emerald-600 active:translate-y-1 active:border-b-0 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Gửi tin nhắn"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1.5 px-1 text-[10px] font-medium text-slate-500">
          Enter để gửi · Shift + Enter xuống dòng
        </p>
      </div>
    </section>
  );
}
