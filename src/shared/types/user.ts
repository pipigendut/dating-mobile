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
  full_name?: string;
  date_of_birth?: string;
  bio?: string;
  height_cm?: number;
  gender?: MasterItem;
  relationship_type?: MasterItem;
  interested_genders?: MasterItem[];
  interests?: MasterItem[];
  languages?: MasterItem[];
  photos?: UserPhoto[];
  location_city?: string;
  location_country?: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  
  // App-specific legacy fields (keep for compatibility if needed, but primary are above)
  fullName?: string;
  heightCm?: number;
  relationshipType?: MasterItem;
  interestedGenders?: MasterItem[];

  authMethod?: 'google' | 'apple' | 'email';
  password?: string;
  googleId?: string;
  phone?: string;
  subscriptionPlan?: 'free' | 'plus' | 'premium' | 'ultimate';
}
