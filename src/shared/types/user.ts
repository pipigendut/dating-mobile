export interface MasterItem {
  id: string;
  name: string;
  icon: string;
}

export interface UserPhoto {
  id?: string;
  url: string;
  isMain: boolean;
}

export interface UserData {
  id?: string;
  email?: string;
  status?: string;
  fullName?: string;
  dateOfBirth?: string;
  bio?: string;
  heightCm?: number;
  gender?: MasterItem;
  relationshipType?: MasterItem;
  interestedGenders?: MasterItem[];
  interests?: MasterItem[];
  languages?: MasterItem[];
  photos?: UserPhoto[];
  locationCity?: string;
  locationCountry?: string;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
  
  // App-specific fields not in main UserResponse
  authMethod?: 'google' | 'apple' | 'email';
  password?: string;
  googleId?: string;
  phone?: string;
  subscriptionPlan?: 'free' | 'plus' | 'premium' | 'ultimate';
}
