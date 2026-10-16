import type { GrammarTopic, SubTopic } from './grammarData';

export type CachedSubTopic = Omit<SubTopic, 'theory'>;
export type CachedTopic = Omit<GrammarTopic, 'subTopics'> & {
  subTopics: CachedSubTopic[];
};

export interface GrammarCurriculumCache {
  version: 1;
  userId: string;
  topics: CachedTopic[];
}

export interface GrammarProgressCache {
  learnedSubTopicIds: string[];
  completedSubTopicIds: string[];
}
