import { UserData } from '../shared/types/user';

/**
 * Maps a snake_case user object from the API to a camelCase UserData object
 */
export const mapUserResponseToData = (data: any): UserData => {
  if (!data) return {} as UserData;

  const mapped: Partial<UserData> = {};

  // Simple fields
  if (data.id !== undefined) mapped.id = data.id;
  if (data.entity_id !== undefined || data.entityId !== undefined) mapped.entityId = data.entity_id || data.entityId;
  if (data.email !== undefined) mapped.email = data.email;
  if (data.status !== undefined) mapped.status = data.status;
  if (data.full_name !== undefined || data.fullName !== undefined) mapped.fullName = data.full_name || data.fullName;
  if (data.date_of_birth !== undefined || data.dateOfBirth !== undefined) mapped.dateOfBirth = data.date_of_birth || data.dateOfBirth;
  if (data.age !== undefined) mapped.age = data.age;
  if (data.bio !== undefined) mapped.bio = data.bio;
  if (data.height_cm !== undefined || data.heightCm !== undefined) mapped.heightCm = data.height_cm || data.heightCm;
  if (data.gender !== undefined) mapped.gender = data.gender;
  if (data.relationship_type !== undefined || data.relationshipType !== undefined) mapped.relationshipType = data.relationship_type || data.relationshipType;
  if (data.interested_genders !== undefined || data.interestedGenders !== undefined) mapped.interestedGenders = data.interested_genders || data.interestedGenders;
  if (data.interests !== undefined) mapped.interests = data.interests;
  if (data.languages !== undefined) mapped.languages = data.languages;
  
  if (data.photos !== undefined) {
    mapped.photos = data.photos?.map((p: any) => ({
      id: p.id,
      url: p.url,
      isMain: p.is_main !== undefined ? p.is_main : p.isMain,
    }));
  }

  if (data.location_city !== undefined || data.locationCity !== undefined) mapped.locationCity = data.location_city || data.locationCity;
  if (data.location_country !== undefined || data.locationCountry !== undefined) mapped.locationCountry = data.location_country || data.locationCountry;
  if (data.latitude !== undefined) mapped.latitude = data.latitude;
  if (data.longitude !== undefined) mapped.longitude = data.longitude;
  
  if (data.created_at !== undefined || data.createdAt !== undefined) mapped.createdAt = data.created_at || data.createdAt;
  if (data.updated_at !== undefined || data.updatedAt !== undefined) mapped.updatedAt = data.updated_at || data.updatedAt;
  if (data.verified_at !== undefined || data.verifiedAt !== undefined) mapped.verifiedAt = data.verified_at || data.verifiedAt;
  
  if (data.subscription_plan !== undefined || data.subscriptionPlan !== undefined) {
    mapped.subscriptionPlan = data.subscription_plan || data.subscriptionPlan;
  }
  
  if (data.subscription !== undefined) {
    if (data.subscription === null) {
      mapped.subscription = undefined;
    } else {
      mapped.subscription = {
        planId: data.subscription.plan_id || data.subscription.planId,
        planName: data.subscription.plan_name || data.subscription.planName,
        startedAt: data.subscription.started_at || data.subscription.startedAt,
        expiredAt: data.subscription.expired_at || data.subscription.expiredAt,
        isActive: data.subscription.is_active !== undefined ? data.subscription.is_active : data.subscription.isActive,
      };
    }
  }

  if (data.consumables !== undefined) {
    mapped.consumables = data.consumables?.map((c: any) => ({
      itemType: c.item_type || c.itemType,
      amount: c.amount,
    }));
  }

  if (data.auth_method !== undefined || data.authMethod !== undefined) {
    mapped.authMethod = data.auth_method || data.authMethod;
  }
  
  if (data.google_id !== undefined || data.googleId !== undefined) {
    mapped.googleId = data.google_id || data.googleId;
  }

  console.log('[userMapper] UserData Mapped (Clean):', mapped);

  return mapped;
};

/**
 * Maps a backend EntityResponse (from swipe/candidates, swipe/likes, etc)
 * to the local Profile interface used by UI components.
 */
export const mapEntityToProfile = (entity: any): any => {
  if (!entity) return null;

  if (entity.type === 'group' && entity.group) {
    const g = entity.group;
    // Map group members' photos to create a collective gallery
    let photos: string[] = [];
    if (g.members && g.members.length > 0) {
      g.members.forEach((m: any) => {
        if (m.photos && m.photos.length > 0) {
          const memberPhotos = m.photos
            .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
            .map((p: any) => p.url);
          photos = [...photos, ...memberPhotos];
        }
      });
    }

    if (photos.length === 0) {
      photos.push('https://images.unsplash.com/photo-1544723795-3fb6469f5b39');
    }
    
    return {
      id: entity.id,
      name: g.name,
      age: 0, 
      location: { 
        city: 'Group', 
        country: '', 
        distance: 0 
      },
      height: 0,
      bio: g.members?.map((m: any) => m.full_name).join(' & ') || 'Double Date Group',
      interests: [],
      photos: photos,
      verified: false,
      isPlusMember: false,
      languages: [],
      lookingFor: ['Double Date'],
      gender: 'other',
      type: 'group',
      members: g.members || [] // Preserve full members for GroupCard
    };
  }

  // Fallback to solo user parsing
  const u = entity.user || entity; // Handle both nested and legacy flat structures temporarily
  if (!u || !u.id) return null;

  return {
    id: entity.id, // Use the entity ID as the primary ID, not the underlying user ID
    userId: u.id, // Keep the underlying user ID for reference if needed
    name: u.full_name || u.fullName,
    age: u.age || 0,
    location: { 
      city: u.location_city || u.locationCity || 'Somewhere', 
      country: u.location_country || u.locationCountry || '', 
      distance: 0 
    },
    height: u.height_cm || u.heightCm || 0,
    bio: u.bio || '',
    interests: u.interests?.map((i: any) => `${i.icon || ''} ${i.name}`) || [],
    photos: u.photos && u.photos.length > 0
      ? [...u.photos].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((p: any) => p.url)
      : ['https://images.unsplash.com/photo-1544723795-3fb6469f5b39'], // Fallback image
    verified: !!(u.verified_at || u.verifiedAt),
    isPlusMember: false,
    languages: u.languages?.map((l: any) => l.name) || [],
    lookingFor: u.relationship_type ? [u.relationship_type.name] : (u.relationshipType ? [u.relationshipType.name] : []),
    gender: 'other', 
  };
};
