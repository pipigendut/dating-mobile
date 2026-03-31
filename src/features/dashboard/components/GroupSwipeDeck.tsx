import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '../../../store/useUserStore';
import { useGroupStore } from '../../../store/useGroupStore';
import { swipeService, SwipeFilter } from '../../../services/api/swipe';
import { userService } from '../../../services/api/user';
import { mapEntityToProfile } from '../../../utils/userMapper';
import { Profile } from '../../../shared/types/profile';
import SharedSwipeDeck from './SharedSwipeDeck';
import GroupCard from './GroupCard';

interface GroupSwipeDeckProps {
  filters?: any;
  isDetailMode: boolean;
  setIsDetailMode: (mode: boolean) => void;
  onOpenSubscription?: () => void;
}

export default function GroupSwipeDeck({
  filters,
  isDetailMode,
  setIsDetailMode,
}: GroupSwipeDeckProps) {
  const { userData } = useUserStore();
  const { group, setGroup } = useGroupStore();

  const userCoords = useMemo(() => ({
    latitude: userData.latitude ?? 0,
    longitude: userData.longitude ?? 0,
  }), [userData.latitude, userData.longitude]);

  const { refetch: refetchGroup, isLoading: isLoadingGroup } = useQuery({
    queryKey: ['user-group'],
    queryFn: async () => {
      try {
        const data = await userService.getMyGroup();
        setGroup(data);
        return data;
      } catch {
        setGroup(null);
        return null;
      }
    },
  });

  const swiperEntityId = group?.entity_id ?? group?.id;

  const {
    data: rawCandidates,
    isLoading: isLoadingCandidates,
    isError,
    refetch: refetchCandidates,
    isFetching,
  } = useQuery({
    queryKey: [
      'swipeCandidates', 'group',
      swiperEntityId, filters,
      userData.latitude, userData.longitude, userData.updatedAt,
    ],
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
        entity_type: 'group',
      };

      return swipeService.getCandidates(apiFilter);
    },
    enabled: !!swiperEntityId,
  });

  const profiles = useMemo<Profile[]>(() => {
    return (rawCandidates ?? [])
      .map((e: any) => mapEntityToProfile(e, userCoords))
      .filter((p): p is Profile => p !== null);
  }, [rawCandidates, userCoords]);

  const handleRefresh = () => {
    refetchGroup();
    if (swiperEntityId) refetchCandidates();
  };

  return (
    <SharedSwipeDeck
      swiperEntityId={swiperEntityId}
      rawProfiles={profiles}
      isLoading={isLoadingGroup || isLoadingCandidates}
      isFetching={isFetching}
      isError={isError}
      refetch={handleRefresh}
      emptyMessage={group ? 'No double date groups nearby' : 'Create a group first!'}
      emptySubtitle={group ? 'Check back later!' : 'Go to your profile to start a group!'}
      isDetailMode={isDetailMode}
      setIsDetailMode={setIsDetailMode}
      renderCard={(card, onToggleDetail) => (
        <GroupCard profile={card} onToggleDetail={onToggleDetail} />
      )}
    />
  );
}
