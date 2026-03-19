export interface MasterItem {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

export interface UserPhoto {
  id?: string;
  url: string;
  isMain: boolean;
}

export interface UserData {
  id?: string;
  email?: string;
  fullName?: string;
  dateOfBirth?: string;
  gender?: MasterItem;
  heightCm?: number;
  bio?: string;
  photos?: UserPhoto[];
  interestedGenders?: MasterItem[];
  interests?: MasterItem[];
  languages?: MasterItem[];
  relationshipType?: MasterItem;
  locationCity?: string;
  locationCountry?: string;
  latitude?: number;
  longitude?: number;
  verifiedAt?: string;
  createdAt?: string;
  updated_at?: string;
  subscriptionPlan?: 'free' | 'premium' | 'gold' | 'ultimate';

  // Auth fields
  authMethod?: 'email' | 'google';
  password?: string;
  googleId?: string;
  status?: string;
}
