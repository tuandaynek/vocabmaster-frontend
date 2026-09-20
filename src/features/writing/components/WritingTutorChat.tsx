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
  const { messages, draft, setDraft, sending, scrollRef, sendMessage } = useTutorChat({
    questionText,
    targetBand,
  });

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
        <div className="rounded-lg bg-indigo-100 p-2 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
          <MessageCircle className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-bold">Socratic Writing Tutor</h2>
          <p className="text-[11px] text-slate-500">Hỏi từng bước · Tự xây dựng lập luận</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <label htmlFor="target-band" className="text-[10px] font-semibold uppercase text-slate-500">
            Target
          </label>
          <select
            id="target-band"
            value={targetBand}
            onChange={(e) => onTargetBandChange(e.target.value)}
            className="rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-indigo-600 dark:border-slate-700 dark:bg-slate-950"
          >
            {["6.0", "6.5", "7.0", "7.5", "8.0", "8.5", "9.0"].map((band) => (
              <option key={band} value={band}>Band {band}</option>
            ))}
          </select>
          <span className="h-2 w-2 rounded-full bg-emerald-500" title="Tutor online" />
        </div>
      </div>

      {/* Task Prompt Input */}
      <div className="shrink-0 border-b border-slate-200 bg-slate-50/50 p-3 dark:border-slate-800 dark:bg-slate-950/50">
        <label htmlFor="tutor-question" className="mb-1 block text-[10px] font-bold uppercase text-slate-500">
          Task 2 prompt
        </label>
        <textarea
          id="tutor-question"
          value={questionText}
          onChange={(e) => onQuestionChange(e.target.value)}
          rows={3}
          placeholder="Dán đề bài để Tutor hiểu đúng chủ đề..."
          className="w-full resize-none bg-transparent text-xs leading-relaxed text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-200"
        />
      </div>

      {/* Message List Component */}
      <ChatMessageList
        messages={messages}
        sending={sending}
        scrollRef={scrollRef as unknown as React.RefObject<HTMLDivElement>}
      />

      {/* Chat Input & Suggestions */}
      <div className="shrink-0 border-t border-slate-200 p-3 dark:border-slate-800">
        <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
          {QUICK_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => void sendMessage(suggestion)}
              disabled={sending}
              className="whitespace-nowrap rounded-full border border-indigo-200 px-2.5 py-1 text-[11px] font-medium text-indigo-700 hover:bg-indigo-50 disabled:opacity-50 dark:border-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-950/50"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-2 rounded-xl border border-slate-200 bg-slate-50 p-2 focus-within:ring-2 focus-within:ring-indigo-500 dark:border-slate-700 dark:bg-slate-950">
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
            className="max-h-24 min-h-10 flex-1 resize-none bg-transparent px-1 py-1 text-sm outline-none"
            aria-label="Tin nhắn cho Writing Tutor"
          />
          <button
            onClick={() => void sendMessage()}
            disabled={!draft.trim() || sending}
            className="rounded-lg bg-indigo-600 p-2.5 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Gửi tin nhắn"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1 text-[10px] text-slate-400">
          Enter để gửi · Shift + Enter xuống dòng
        </p>
      </div>
    </section>
  );
}