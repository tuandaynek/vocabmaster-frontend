export interface WebsiteApiEnvelope<T> {
  message: string;
  data: T;
}

export interface RatingRecord {
  id: string;
  feature_name: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface RatingSubmissionResponse {
  message: string;
  rating: RatingRecord;
}

export interface WebsiteStats {
  totalUsers: number;
  avgRating: number;
  totalRatings: number;
}

export interface WebsiteFeedback {
  id: string;
  feature_name: string;
  rating: number;
  comment: string;
  created_at: string;
  users: {
    username: string;
    avatar_url: string | null;
  } | null;
}

export interface PublicWebsiteStats {
  stats: WebsiteStats;
  recentFeed: WebsiteFeedback[];
}

export interface RatingSubmission {
  rating: number;
  fastComments: string[];
  comment: string;
}
