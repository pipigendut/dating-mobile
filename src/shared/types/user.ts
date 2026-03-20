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

export interface UserSubscription {
  planId: string;
  planName?: string;
  startedAt: string;
  expiredAt: string;
  isActive: boolean;
}

export interface UserConsumable {
  itemType: string;
  amount: number;
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
  updatedAt?: string;
  subscriptionPlan?: 'free' | 'premium' | 'gold' | 'ultimate';
  subscription?: UserSubscription;
  consumables?: UserConsumable[];

  // Auth fields
  authMethod?: 'email' | 'google';
  password?: string;
  googleId?: string;
  status?: string;
}
