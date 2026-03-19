import apiClient from './client';

export interface PhotoDTO {
  id: string;
  url: string;
  is_main: boolean;
  sort_order: number;
}

export interface UserSwipeProfileResponse {
  id: string;
  full_name: string;
  age: number;
  bio: string;
  height_cm: number;
  location_city: string;
  location_country: string;
  photos: PhotoDTO[];
  interests?: any[];
  languages?: any[];
  relationship_type?: any;
  verified_at?: string;
}

export interface MatchResponse {
  is_match: boolean;
  match_id?: string;
  matched_user?: UserSwipeProfileResponse;
}

export interface SwipeFilter {
  distance?: number;
  min_age?: number;
  max_age?: number;
  genders?: string[];
  interests?: string[];
  relationship_types?: string[];
  latitude?: number;
  longitude?: number;
  min_height?: number;
  max_height?: number;
}

export interface IncomingLikeResponse {
  user: UserSwipeProfileResponse;
  is_crush: boolean;
  priority_score: number;
  swipe_time: string;
}

export const swipeService = {
  /**
   * Get swipe candidates list
   */
  getCandidates: async (filter?: SwipeFilter) => {
    const response = await apiClient.get('/swipe/candidates', { params: filter });
    return response.data as UserSwipeProfileResponse[];
  },

  /**
   * Record a swipe action (LIKE, DISLIKE, or CRUSH)
   */
  swipe: async (swipedId: string, direction: 'LIKE' | 'DISLIKE' | 'CRUSH') => {
    const response = await apiClient.post('/swipe/', {
      swiped_id: swipedId,
      direction: direction,
    });
    return response.data as MatchResponse;
  },

  /**
   * Undo the last swipe action
   */
  undoLastSwipe: async () => {
    const response = await apiClient.post('/swipe/undo');
    return response.data as UserSwipeProfileResponse;
  },

  /**
   * Get list of users who have liked or crushed on the current user
   */
  getIncomingLikes: async () => {
    const response = await apiClient.get('/swipe/likes');
    return response.data as IncomingLikeResponse[];
  },

  /**
   * Get list of users the current user has liked
   */
  getSentLikes: async () => {
    const response = await apiClient.get('/swipe/likes/sent');
    return response.data as SentLikeResponse[];
  },

  /**
   * Unlike a user (remove like before match)
   */
  unlike: async (targetUserId: string) => {
    const response = await apiClient.delete('/swipe/unlike', {
      data: { target_user_id: targetUserId },
    });
    return response.data;
  },
};

export interface SentLikeResponse {
  user: UserSwipeProfileResponse;
  created_at: string;
  expires_at: string;
}
