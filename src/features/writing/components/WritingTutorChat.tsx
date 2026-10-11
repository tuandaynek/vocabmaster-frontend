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
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[32px] border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-xl">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-slate-800 px-5 py-4 bg-slate-950/40">
        <div className="rounded-2xl bg-indigo-500/10 border border-indigo-500/20 p-2.5 text-indigo-400 shadow-inner">
          <MessageCircle className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-white">
            Socratic Writing Tutor
          </h2>
          <p className="text-[11px] text-slate-400">
            Hỏi từng bước · Tự xây dựng lập luận
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <label
            htmlFor="target-band"
            className="text-[10px] font-bold uppercase text-slate-400"
          >
            Target
          </label>
          <select
            id="target-band"
            value={targetBand}
            onChange={(e) => onTargetBandChange(e.target.value)}
            className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-1.5 text-xs font-bold text-indigo-400 outline-none cursor-pointer"
          >
            {["6.0", "6.5", "7.0", "7.5", "8.0", "8.5", "9.0"].map((band) => (
              <option
                key={band}
                value={band}
                className="bg-slate-900 text-white"
              >
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
      <div className="shrink-0 border-b border-slate-800 bg-slate-950/60 p-4">
        <label
          htmlFor="tutor-question"
          className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400"
        >
          Task 2 prompt
        </label>
        <textarea
          id="tutor-question"
          value={questionText}
          onChange={(e) => onQuestionChange(e.target.value)}
          rows={3}
          placeholder="Dán đề bài để Tutor hiểu đúng chủ đề..."
          className="w-full resize-none rounded-2xl bg-slate-900 border border-slate-800 p-3 text-xs leading-relaxed text-slate-200 outline-none placeholder:text-slate-600 focus:border-indigo-500"
        />
      </div>

      {/* Message List Component */}
      <ChatMessageList
        messages={messages}
        sending={sending}
        scrollRef={scrollRef as unknown as React.RefObject<HTMLDivElement>}
      />

      {/* Chat Input & Suggestions */}
      <div className="shrink-0 border-t border-slate-800 p-4 bg-slate-950/40">
        <div className="mb-2.5 flex gap-2 overflow-x-auto pb-1">
          {QUICK_SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => void sendMessage(suggestion)}
              disabled={sending}
              className="whitespace-nowrap rounded-2xl border border-indigo-500/30 bg-indigo-500/10 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-indigo-500/20 disabled:opacity-50 transition shadow-sm"
            >
              {suggestion}
            </button>
          ))}
        </div>
        <div className="flex items-end gap-2.5 rounded-2xl border border-slate-800 bg-slate-950 p-2.5 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500">
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
            className="max-h-24 min-h-10 flex-1 resize-none bg-transparent px-2 py-1 text-xs text-slate-200 outline-none placeholder:text-slate-600"
            aria-label="Tin nhắn cho Writing Tutor"
          />
          <button
            onClick={() => void sendMessage()}
            disabled={!draft.trim() || sending}
            className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 p-2.5 text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 shadow-md shadow-indigo-600/30 transition"
            aria-label="Gửi tin nhắn"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-1.5 text-[10px] text-slate-500 font-medium px-1">
          Enter để gửi · Shift + Enter xuống dòng
        </p>
      </div>
    </section>
  );
}
