import type { FocusMode } from "../types";

export const LIMIT_OPTIONS = [5, 10, 15] as const;

export const FOCUS_MODES: Array<{ value: FocusMode; description: string }> = [
  { value: "IELTS Academic", description: "Từ vựng học thuật trọng tâm" },
  { value: "SAT / GMAT", description: "Ngôn ngữ học thuật & suy luận" },
  {
    value: "Collocations & Phrasal Verbs",
    description: "Cụm từ tự nhiên trong ngữ cảnh",
  },
  {
    value: "Prefix & Suffix Deep Dive",
    description: "Bóc tách cấu tạo từ chuyên sâu",
  },
];

export const SAMPLE_PASSAGES: Record<string, string> = {
  "Sleep & Memory":
    "Researchers carry out studies to understand the effects of sleep deprivation. Poor sleep habits can lead to exhaustion, stress, and reduced concentration. Sleep plays a crucial role in memory consolidation and emotional regulation.",
  "Climate Policy":
    "The government implemented several measures to mitigate the impact of the recession. However, the long-term effects of the policy remained detrimental to many households, and the unclear instructions made it difficult for citizens to understand the new regulations.",
};