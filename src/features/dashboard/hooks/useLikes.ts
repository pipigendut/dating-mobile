import { useInfiniteQuery } from '@tanstack/react-query';
import { swipeService } from '../../../services/api/swipe';
import { useUserStore } from '../../../store/useUserStore';
import { useGroupStore } from '../../../store/useGroupStore';

const PAGE_SIZE = 20;

export const useLikesReceived = () => {
  const { userData } = useUserStore();
  const { group } = useGroupStore();
  const activeEntityId = group?.entity_id || userData.entityId;

  return useInfiniteQuery({
    queryKey: ['likes', 'received', activeEntityId],
    queryFn: ({ pageParam = 0 }) =>
      activeEntityId
        ? swipeService.getIncomingLikes(activeEntityId, PAGE_SIZE, pageParam)
        : Promise.resolve([]),
    enabled: !!activeEntityId,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return (lastPage && lastPage.length === PAGE_SIZE) ? allPages.length * PAGE_SIZE : undefined;
    },
  });
};

export const useLikesSent = () => {
  const { userData } = useUserStore();
  const { group } = useGroupStore();
  const activeEntityId = group?.entity_id || userData.entityId;

  return useInfiniteQuery({
    queryKey: ['likes', 'sent', activeEntityId],
    queryFn: ({ pageParam = 0 }) =>
      activeEntityId
        ? swipeService.getSentLikes(activeEntityId, PAGE_SIZE, pageParam)
        : Promise.resolve([]),
    enabled: !!activeEntityId,
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      return (lastPage && lastPage.length === PAGE_SIZE) ? allPages.length * PAGE_SIZE : undefined;
    },
  });
};
