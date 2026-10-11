export interface ActivityItem {
  date: string;
  xpGained: number;
  streak: number;
}

export interface UserProfile {
  username: string;
  email: string;
  avatarUrl: string;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  cachedVocabCount: number;
  cachedCollocationCount: number;
  lastActiveDate: string;
  activityHistory: ActivityItem[];
  levelInfo: {
    level: number;
    currentLevelXp: number;
    nextLevelXp: number;
    progressPercent: number;
  }
}

export interface UserProfileResponse {
  data: UserProfile;
  message: string;
  success: boolean;
}