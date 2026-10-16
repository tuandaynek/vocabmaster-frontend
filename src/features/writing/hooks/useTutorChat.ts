import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { writingApi } from "../api/writingApi";
import type { ChatMessage } from "../types/writing.types";

interface UseTutorChatProps {
  questionText: string;
  targetBand: string;
}

export function useTutorChat({ questionText, targetBand }: UseTutorChatProps) {
  const topic = questionText.trim() || "chủ đề trong đề bài";
  const initialMessage = useMemo(
    () =>
      `Chào bạn! Đề bài yêu cầu phân tích về **${topic}**. Bạn đang muốn lập luận theo hướng Đồng ý, Không đồng ý, hay Trung lập? Hãy chia sẻ góc nhìn thô của bạn nhé!`,
    [topic],
  );

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    { role: "assistant", content: initialMessage },
  ]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, sending]);

  const sendMessage = async (customMessage?: string) => {
    const content = (customMessage ?? draft).trim();
    if (!content || sending) return;

    if (!questionText.trim()) {
      toast.error("Hãy nhập đề bài trước khi trò chuyện với Tutor.");
      return;
    }

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content }];
    setMessages(nextMessages);
    setDraft("");
    setSending(true);

    try {
      const reply = await writingApi.sendTutorMessage({
        questionText,
        targetBand,
        chatHistory: nextMessages,
        userMessage: content,
      });

      setMessages((current) => [
        ...current,
        { role: "assistant", content: reply },
      ]);
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: "Mình chưa kết nối được với Tutor. Bạn thử gửi lại câu hỏi nhé.",
        },
      ]);
      toast.error("Không thể gửi tin nhắn tới Writing Tutor.");
    } finally {
      setSending(false);
    }
  };

  return {
    messages,
    draft,
    setDraft,
    sending,
    scrollRef,
    sendMessage,
  };
}