export interface GrammarSessionProgressPayload {
  topicId: string;
  subTopicId: string;
  score: number;
  correctCount: number;
  totalQuestions: number;
  isCompleted?: boolean;
}

export interface GrammarProgressRecord {
  id: string;
  topic_id: string;
  sub_topic_id: string;
  progress_percentage: number;
  is_mastered: boolean;
  is_locked: boolean;
  last_score: number;
  updated_at: string;
  grammar_topics?: { title: string } | null;
  grammar_sub_topics?: { title: string } | null;
}
