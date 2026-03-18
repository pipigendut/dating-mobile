import { useQuery } from '@tanstack/react-query';
import { swipeService, IncomingLikeResponse, SentLikeResponse } from '../../../services/api/swipe';

export const useLikesReceived = () => {
  return useQuery({
    queryKey: ['likes', 'received'],
    queryFn: swipeService.getIncomingLikes,
  });
};

export const useLikesSent = () => {
  return useQuery({
    queryKey: ['likes', 'sent'],
    queryFn: swipeService.getSentLikes,
  });
};
