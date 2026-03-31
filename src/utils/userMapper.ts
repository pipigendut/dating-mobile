import { UserData } from '../shared/types/user';
import { Profile } from '../shared/types/profile';
import { DEFAULT_IMAGES } from '../shared/constants/images';
import { getDistance } from 'geolib';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Coords {
  latitude: number;
  longitude: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Calculates straight-line distance in kilometers between two coordinates.
 * Returns 0 if either coordinate is missing.
 */
function calculateDistanceKm(from: Coords | undefined, to: Coords | undefined): number {
  if (!from || !to || !from.latitude || !from.longitude || !to.latitude || !to.longitude) {
    return 0;
  }
  const meters = getDistance(
    { latitude: from.latitude, longitude: from.longitude },
    { latitude: to.latitude, longitude: to.longitude }
  );
  return Math.round(meters / 1000);
}

/**
 * Sorts photos by sort_order and extracts their URLs.
 */
function extractPhotoUrls(photos: any[]): string[] {
  return [...photos]
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
    .map((p) => p.url);
}

// ─── Mappers ──────────────────────────────────────────────────────────────────

/**
 * Maps a snake_case API user response to a camelCase UserData object.
 */
export const mapUserResponseToData = (data: any): UserData => {
  if (!data) return {} as UserData;

  const mapped: Partial<UserData> = {};

  if (data.id !== undefined) mapped.id = data.id;
  if (data.entity_id !== undefined || data.entityId !== undefined) mapped.entityId = data.entity_id ?? data.entityId;
  if (data.email !== undefined) mapped.email = data.email;
  if (data.status !== undefined) mapped.status = data.status;
  if (data.full_name !== undefined || data.fullName !== undefined) mapped.fullName = data.full_name ?? data.fullName;
  if (data.date_of_birth !== undefined || data.dateOfBirth !== undefined) mapped.dateOfBirth = data.date_of_birth ?? data.dateOfBirth;
  if (data.age !== undefined) mapped.age = data.age;
  if (data.bio !== undefined) mapped.bio = data.bio;
  if (data.height_cm !== undefined || data.heightCm !== undefined) mapped.heightCm = data.height_cm ?? data.heightCm;
  if (data.gender !== undefined) mapped.gender = data.gender;
  if (data.relationship_type !== undefined || data.relationshipType !== undefined) mapped.relationshipType = data.relationship_type ?? data.relationshipType;
  if (data.interested_genders !== undefined || data.interestedGenders !== undefined) mapped.interestedGenders = data.interested_genders ?? data.interestedGenders;
  if (data.interests !== undefined) mapped.interests = data.interests;
  if (data.languages !== undefined) mapped.languages = data.languages;

  if (data.photos !== undefined) {
    mapped.photos = data.photos?.map((p: any) => ({
      id: p.id,
      url: p.url,
      isMain: p.is_main !== undefined ? p.is_main : p.isMain,
    }));
  }

  if (data.location_city !== undefined || data.locationCity !== undefined) mapped.locationCity = data.location_city ?? data.locationCity;
  if (data.location_country !== undefined || data.locationCountry !== undefined) mapped.locationCountry = data.location_country ?? data.locationCountry;
  if (data.latitude !== undefined) mapped.latitude = data.latitude;
  if (data.longitude !== undefined) mapped.longitude = data.longitude;

  if (data.created_at !== undefined || data.createdAt !== undefined) mapped.createdAt = data.created_at ?? data.createdAt;
  if (data.updated_at !== undefined || data.updatedAt !== undefined) mapped.updatedAt = data.updated_at ?? data.updatedAt;
  if (data.verified_at !== undefined || data.verifiedAt !== undefined) mapped.verifiedAt = data.verified_at ?? data.verifiedAt;

  if (data.subscription_plan !== undefined || data.subscriptionPlan !== undefined) {
    mapped.subscriptionPlan = data.subscription_plan ?? data.subscriptionPlan;
  }

  if (data.subscription !== undefined) {
    if (data.subscription === null) {
      mapped.subscription = undefined;
    } else {
      mapped.subscription = {
        planId: data.subscription.plan_id ?? data.subscription.planId,
        planName: data.subscription.plan_name ?? data.subscription.planName,
        startedAt: data.subscription.started_at ?? data.subscription.startedAt,
        expiredAt: data.subscription.expired_at ?? data.subscription.expiredAt,
        isActive: data.subscription.is_active !== undefined ? data.subscription.is_active : data.subscription.isActive,
      };
    }
  }

  if (data.consumables !== undefined) {
    mapped.consumables = data.consumables?.map((c: any) => ({
      itemType: c.item_type ?? c.itemType,
      amount: c.amount,
    }));
  }

  if (data.auth_method !== undefined || data.authMethod !== undefined) {
    mapped.authMethod = data.auth_method ?? data.authMethod;
  }

  if (data.google_id !== undefined || data.googleId !== undefined) {
    mapped.googleId = data.google_id ?? data.googleId;
  }

  return mapped;
};

/**
 * Maps a backend EntityResponse (from swipe/candidates, swipe/likes, etc.)
 * to the local Profile interface used by UI components.
 *
 * @param entity - Raw API entity object
 * @param currentUserCoords - Current user's location for distance calculation
 */
export const mapEntityToProfile = (entity: any, currentUserCoords?: Coords): Profile | null => {
  if (!entity) return null;

  // ── Group entity ──────────────────────────────────────────────────────────
  if (entity.type === 'group' && entity.group) {
    const g = entity.group;
    const firstMember = g.members?.[0];

    const photos: string[] = g.members?.flatMap((m: any) =>
      m.photos?.length > 0 ? extractPhotoUrls(m.photos) : []
    ) ?? [];

    return {
      id: entity.id,
      name: g.name,
      age: 0,
      location: {
        city: 'Group',
        country: '',
        distance: calculateDistanceKm(currentUserCoords, firstMember),
      },
      latitude: firstMember?.latitude ?? 0,
      longitude: firstMember?.longitude ?? 0,
      height: 0,
      bio: g.members?.map((m: any) => m.full_name).join(' & ') || 'Double Date Group',
      interests: [],
      photos: photos.length > 0 ? photos : [DEFAULT_IMAGES.USER_AVATAR],
      verified: false,
      verifiedAt: '',
      isPlusMember: false,
      languages: [],
      lookingFor: ['Double Date'],
      gender: 'other',
      type: 'group',
      members: g.members ?? [],
    };
  }

  // ── Solo user entity ──────────────────────────────────────────────────────
  const u = entity.user ?? entity;
  if (!u?.id) return null;

  const photos = u.photos?.length > 0
    ? extractPhotoUrls(u.photos)
    : [DEFAULT_IMAGES.USER_AVATAR];

  return {
    id: entity.id,
    userId: u.id,
    name: u.full_name ?? u.fullName,
    age: u.age ?? 0,
    location: {
      city: u.location_city ?? u.locationCity ?? 'Somewhere',
      country: u.location_country ?? u.locationCountry ?? '',
      distance: calculateDistanceKm(currentUserCoords, u),
    },
    latitude: u.latitude ?? 0,
    longitude: u.longitude ?? 0,
    height: u.height_cm ?? u.heightCm ?? 0,
    bio: u.bio ?? '',
    interests: u.interests?.map((i: any) => `${i.icon ?? ''} ${i.name}`.trim()) ?? [],
    photos,
    verified: !!(u.verified_at ?? u.verifiedAt),
    verifiedAt: u.verified_at ?? u.verifiedAt ?? '',
    isPlusMember: false,
    languages: u.languages?.map((l: any) => l.name) ?? [],
    lookingFor: u.relationship_type?.name
      ? [u.relationship_type.name]
      : u.relationshipType?.name
        ? [u.relationshipType.name]
        : [],
    gender: u.gender?.name?.toLowerCase() ?? 'other',
    mainPhoto: u.main_photo ?? photos[0],
    type: 'user',
  };
};
