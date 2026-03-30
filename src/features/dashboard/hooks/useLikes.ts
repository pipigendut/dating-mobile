import { useInfiniteQuery } from '@tanstack/react-query';
import { swipeService } from '../../../services/api/swipe';
import { useUserStore } from '../../../store/useUserStore';
import { useGroupStore } from '../../../store/useGroupStore';

const PAGE_SIZE = 20;

export const useLikesReceived = () => {
  return useInfiniteQuery({
    queryKey: ['likes', 'received'],
    queryFn: ({ pageParam = 0 }) => swipeService.getIncomingLikes(PAGE_SIZE, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return (lastPage && lastPage.length === PAGE_SIZE) ? allPages.length * PAGE_SIZE : undefined;
    },
  });
};

export const useLikesSent = () => {
  return useInfiniteQuery({
    queryKey: ['likes', 'sent'],
    queryFn: ({ pageParam = 0 }) => swipeService.getSentLikes(PAGE_SIZE, pageParam),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return (lastPage && lastPage.length === PAGE_SIZE) ? allPages.length * PAGE_SIZE : undefined;
    },
  });
};
