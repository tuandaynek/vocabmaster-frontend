import type { FocusMode } from "../types";

export const LIMIT_OPTIONS = [6, 9, 12, 15] as const;

export const FOCUS_MODES: Array<{ value: FocusMode; description: string }> = [
  { 
    value: "IELTS Academic", 
    description: "Nhặt từ đơn học thuật (Band 6.5+) dùng cho Reading & Writing" 
  },
  { 
    value: "SAT / GMAT", 
    description: "Nhặt từ nâng cao, trang trọng & giàu tính lập luận" 
  },
  {
    value: "Collocations & Phrasal Verbs",
    description: "Chỉ nhặt cụm từ ghép & cụm động từ tự nhiên trong bài"
  },
];

export const SAMPLE_PASSAGES: Record<string, string> = {
  "Sleep & Memory":
    "Researchers carry out studies to understand the effects of sleep deprivation. Poor sleep habits can lead to exhaustion, stress, and reduced concentration. Sleep plays a crucial role in memory consolidation and emotional regulation.",
  "Climate Policy":
    "The government implemented several measures to mitigate the impact of the recession. However, the long-term effects of the policy remained detrimental to many households, and the unclear instructions made it difficult for citizens to understand the new regulations.",
};
