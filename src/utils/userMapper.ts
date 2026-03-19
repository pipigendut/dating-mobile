import { UserData } from '../shared/types/user';

/**
 * Maps a snake_case user object from the API to a camelCase UserData object
 */
export const mapUserResponseToData = (data: any): UserData => {
  if (!data) return {} as UserData;

  const mapped: UserData = {
    ...data, // Keep original fields just in case
    id: data.id,
    email: data.email,
    status: data.status,
    fullName: data.full_name || data.fullName,
    full_name: data.full_name || data.fullName,
    dateOfBirth: data.date_of_birth || data.dateOfBirth,
    date_of_birth: data.date_of_birth || data.dateOfBirth,
    bio: data.bio,
    heightCm: data.height_cm || data.heightCm,
    height_cm: data.height_cm || data.heightCm,
    gender: data.gender,
    relationshipType: data.relationship_type || data.relationshipType,
    relationship_type: data.relationship_type || data.relationshipType,
    interestedGenders: data.interested_genders || data.interestedGenders,
    interested_genders: data.interested_genders || data.interestedGenders,
    interests: data.interests,
    languages: data.languages,
    photos: data.photos?.map((p: any) => ({
      id: p.id,
      url: p.url,
      isMain: p.is_main !== undefined ? p.is_main : p.isMain,
    })),
    locationCity: data.location_city || data.locationCity,
    location_city: data.location_city || data.locationCity,
    locationCountry: data.location_country || data.locationCountry,
    location_country: data.location_country || data.locationCountry,
    latitude: data.latitude,
    longitude: data.longitude,
    createdAt: data.created_at || data.createdAt,
    created_at: data.created_at || data.createdAt,
    updatedAt: data.updated_at || data.updatedAt,
    updated_at: data.updated_at || data.updatedAt,
    verifiedAt: data.verified_at || data.verifiedAt,
    verified_at: data.verified_at || data.verifiedAt,
    
    // Application state
    subscriptionPlan: data.subscription_plan || data.subscriptionPlan || 'free',
  };

  return mapped;
};
