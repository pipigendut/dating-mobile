export interface ProfileLocation {
  city: string;
  country: string;
  distance: number;
}

export interface Profile {
  id: string;
  name: string;
  age: number;
  location: ProfileLocation;
  latitude?: number;
  longitude?: number;
  height: number;
  bio: string;
  interests: string[];
  photos: string[];
  verifiedAt: string;
  isPlusMember?: boolean;
  languages?: string[];
  lookingFor?: string[];
  gender: 'male' | 'female' | 'other';
  type?: 'user' | 'group';
  members?: any[];
  mainPhoto?: string;
  relationshipType?: string;
  userId?: string;
  verified?: boolean;
}
