import type { RefObject } from "react";
import { Bot, Loader2, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { ChatMessage } from "../types/writing.types";
import { sanitizeMarkdown } from "../utils/markdownUtils";

interface ChatMessageListProps {
  messages: ChatMessage[];
  sending: boolean;
  scrollRef: RefObject<HTMLDivElement>;
}

export function ChatMessageList({ messages, sending, scrollRef }: ChatMessageListProps) {
  return (
    <div
      ref={scrollRef}
      className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-slate-300 dark:[&::-webkit-scrollbar-thumb]:bg-slate-700 hover:[&::-webkit-scrollbar-thumb]:bg-slate-400 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-600"
    >
      {messages.map((message, index) => (
        <div
          key={`${message.role}-${index}`}
          className={`flex gap-2.5 ${message.role === "user" ? "justify-end" : "justify-start"}`}
        >
          {message.role === "assistant" && (
            <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-300">
              <Bot className="h-4 w-4" />
            </div>
          )}

          <div
            className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 ${
              message.role === "user"
                ? "rounded-br-md bg-indigo-600 text-white"
                : "rounded-bl-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-200"
            }`}
          >
            {message.role === "assistant" ? (
              <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-slate-800 dark:text-slate-100 prose-p:my-1.5 prose-ul:my-1 prose-ol:my-1 prose-li:my-0.5">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="my-2 text-sm leading-relaxed text-slate-800 dark:text-slate-100">
                        {children}
                      </p>
                    ),
                    ul: ({ children }) => (
                      <ul className="my-3 space-y-1.5 rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 text-sm dark:border-indigo-900/50 dark:bg-indigo-950/30">
                        {children}
                      </ul>
                    ),
                    li: ({ children }) => (
                      <li className="flex items-start gap-2.5 text-slate-700 dark:text-slate-200">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
                        <div className="flex-1 leading-relaxed [&>p]:inline [&>p]:m-0 [&>p]:p-0">
                          {children}
                        </div>
                      </li>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold text-slate-900 dark:text-white">
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
            <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-200">
              <User className="h-4 w-4" />
            </div>
          )}
        </div>
      ))}

      {sending && (
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-500" />
          Tutor đang suy nghĩ...
        </div>
      )}
    </div>
  );
}