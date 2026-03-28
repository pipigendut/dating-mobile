import apiClient from './client';
import { EntityResponse } from '../../shared/types/entity';

export interface MatchResponse {
  is_match: boolean;
  match_id?: string;
  matched_entity?: EntityResponse;
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
  entity_type?: 'user' | 'group'; // "user" = Yourself deck, "group" = Double Date deck
  swiper_entity_id: string; // REQUIRED: The entity (user or group) that is swiping
}

export interface IncomingLikeResponse {
  entity: EntityResponse;
  is_crush: boolean;
  is_boosted: boolean;
  swipe_time: string;
}

export interface SentLikeResponse {
  entity: EntityResponse;
  is_crush: boolean;
  is_boosted: boolean;
  created_at: string;
  expires_at: string;
}

export interface LikesSummaryResponse {
  count: number;
  last_photo: string;
}

export const swipeService = {
  /**
   * Get likes summary (count and last photo)
   */
  getLikesSummary: async (entityId: string) => {
    const response = await apiClient.get<LikesSummaryResponse>('/swipe/likes/count', {
      params: { entity_id: entityId }
    });
    return response.data;
  },
  /**
   * Get swipe candidates list, filtered by entity_type if provided.
   */
  getCandidates: async (filter: SwipeFilter) => {
    const response = await apiClient.get('/swipe/candidates', { params: filter });
    return response.data as EntityResponse[];
  },

  /**
   * Record a swipe action (LIKE, DISLIKE, or CRUSH)
   */
  swipe: async (swiperEntityId: string, swipedEntityId: string, direction: 'LIKE' | 'DISLIKE' | 'CRUSH') => {
    const response = await apiClient.post('/swipe/', {
      swiper_entity_id: swiperEntityId,
      swiped_entity_id: swipedEntityId,
      direction: direction,
    });
    return response.data as MatchResponse;
  },

  /**
   * Get list of entities who have liked or crushed on the current active entity
   */
  getIncomingLikes: async (entityId: string, limit?: number, offset?: number) => {
    const response = await apiClient.get('/swipe/likes', { params: { entity_id: entityId, limit, offset } });
    return response.data as IncomingLikeResponse[];
  },

  /**
   * Get list of entities the current active entity has liked
   */
  getSentLikes: async (entityId: string, limit?: number, offset?: number) => {
    const response = await apiClient.get('/swipe/likes/sent', { params: { entity_id: entityId, limit, offset } });
    return response.data as SentLikeResponse[];
  },

  /**
   * Unmatch an entity
   */
  unmatch: async ({ swiperEntityId, targetEntityId }: { swiperEntityId: string, targetEntityId: string }) => {
    const response = await apiClient.post(`/swipe/unmatch/${targetEntityId}`, null, {
      params: { swiper_entity_id: swiperEntityId }
    });
    return response.data;
  },
 
  /**
   * Unlike an entity (remove a sent like)
   */
  unlike: async ({ swiperEntityId, targetEntityId }: { swiperEntityId: string, targetEntityId: string }) => {
    const response = await apiClient.delete(`/swipe/unlike/${targetEntityId}`, {
      params: { swiper_entity_id: swiperEntityId }
    });
    return response.data;
  },
};
