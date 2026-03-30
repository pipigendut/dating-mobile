import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '../../../store/useUserStore';
import { swipeService, SwipeFilter } from '../../../services/api/swipe';
import { mapEntityToProfile } from '../../../utils/userMapper';
import SharedSwipeDeck from './SharedSwipeDeck';
import ProfileCard from './ProfileCard';

interface UserSwipeDeckProps {
  filters?: any;
  isDetailMode: boolean;
  setIsDetailMode: (mode: boolean) => void;
  onOpenSubscription?: () => void;
}

export default function UserSwipeDeck({ filters, isDetailMode, setIsDetailMode, onOpenSubscription }: UserSwipeDeckProps) {
  const { userData } = useUserStore();
  const swiperEntityId = userData.entityId;

  const { data: candidatesResponse, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['swipeCandidates', 'user', swiperEntityId, filters, userData.latitude, userData.longitude, userData.updatedAt],
    queryFn: () => {
      if (!swiperEntityId) return [];

      const apiFilter: SwipeFilter = {
        swiper_entity_id: swiperEntityId,
        distance: filters?.distance,
        min_age: filters?.ageRange?.[0],
        max_age: filters?.ageRange?.[1],
        genders: filters?.gender,
        interests: filters?.interests,
        relationship_types: filters?.lookingFor,
        latitude: filters?.explorerMode && filters?.latitude ? filters.latitude : userData.latitude,
        longitude: filters?.explorerMode && filters?.longitude ? filters.longitude : userData.longitude,
        min_height: filters?.heightRange?.[0],
        max_height: filters?.heightRange?.[1],
        entity_type: 'user',
      };
      return swipeService.getCandidates(apiFilter);
    },
    enabled: !!swiperEntityId,
  });

  const rawProfiles = useMemo(() => {
    return candidatesResponse ? candidatesResponse.map(mapEntityToProfile).filter(Boolean) : [];
  }, [candidatesResponse]);

  return (
    <SharedSwipeDeck
      swiperEntityId={swiperEntityId}
      rawProfiles={rawProfiles as any}
      isLoading={isLoading}
      isFetching={isFetching}
      isError={isError}
      refetch={refetch}
      emptyMessage="No more profiles"
      emptySubtitle="Check back later for new people!"
      isDetailMode={isDetailMode}
      setIsDetailMode={setIsDetailMode}
      renderCard={(card, onToggleDetail) => (
        <ProfileCard
          profile={card}
          onToggleDetail={onToggleDetail}
        />
      )}
    />
  );
}
