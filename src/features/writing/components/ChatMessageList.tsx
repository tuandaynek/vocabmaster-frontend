import type { RefObject } from "react";
import { Bot, Loader2, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { ChatMessage } from "../types/writing.types";
import { sanitizeMarkdown } from "../utils/markdownUtils";

interface ChatMessageListProps {
  messages: ChatMessage[];
  sending: boolean;
  scrollRef: RefObject<HTMLDivElement | null>;
}

export function ChatMessageList({ messages, sending, scrollRef }: ChatMessageListProps) {
  return (
    <div
      ref={scrollRef}
      className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400"
    >
      {messages.map((message, index) => (
        <div
          key={`${message.role}-${index}`}
          className={`flex gap-2.5 ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          {message.role === "assistant" && (
            <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-sky-200 bg-sky-50 text-sky-700">
              <Bot className="h-4 w-4" />
            </div>
          )}

          <div
            className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${
              message.role === "user"
                ? "border-b-4 border-emerald-700 bg-emerald-500 text-white"
                : "border-2 border-slate-100 bg-slate-50 text-slate-700"
            }`}
          >
            {message.role === "assistant" ? (
              <div className="prose max-w-none text-sm leading-relaxed text-slate-700 prose-headings:text-slate-800 prose-p:my-1.5 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="my-2 text-sm leading-relaxed text-slate-700">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="my-3 space-y-1.5 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-sm">
                        {children}
                      </ul>
                    ),
                    li: ({ children }) => (
                      <li className="flex items-start gap-2.5 text-slate-700">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                        <div className="flex-1 leading-relaxed [&>p]:inline [&>p]:m-0 [&>p]:p-0">
                          {children}
                        </div>
                      </li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-slate-800">
                        {children}
                      </strong>
                    ),
                  }}
                >
                  {sanitizeMarkdown(message.content)}
                </ReactMarkdown>
              </div>
            ) : (
              message.content
            )}
          </div>

          {message.role === "user" && (
            <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber-200 bg-amber-50 text-amber-800">
              <User className="h-4 w-4" />
            </div>
          )}
        </div>
      ))}

      {sending && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
          Tutor đang suy nghĩ...
        </div>
      )}
    </div>
  );
}