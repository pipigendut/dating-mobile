export interface UserPhoto {
  id?: string;
  url: string;
  isMain: boolean;
}

export interface UserData {
  id?: string;
  authMethod?: 'google' | 'apple' | 'email';
  name?: string;
  birthDate?: string;
  email?: string;
  password?: string;
  googleId?: string;
  phone?: string;
  height?: number;
  photos?: UserPhoto[];
  gender?: string;
  interestedIn?: string[];
  bio?: string;
  interests?: string[];
  location?: { city: string; country: string; latitude?: number; longitude?: number; distance?: number };
  languages?: string[];
  lookingFor?: string[];
  profileImage?: string;
  subscriptionPlan?: 'free' | 'plus' | 'premium' | 'ultimate';
}
