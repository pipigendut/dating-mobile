export interface UserData {
  authMethod?: 'google' | 'apple' | 'email';
  name?: string;
  birthDate?: string;
  email?: string;
  phone?: string;
  height?: number;
  photos?: string[];
  gender?: 'male' | 'female' | 'other';
  interestedIn?: ('male' | 'female' | 'everyone')[];
  bio?: string;
  interests?: string[];
  location?: { city: string; country: string; distance?: number };
  languages?: string[];
  lookingFor?: string[];
  profileImage?: string;
  subscriptionPlan?: 'free' | 'plus' | 'premium' | 'ultimate';
}
