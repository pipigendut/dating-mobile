import React, { createContext, useState, useContext, ReactNode } from 'react';

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
  subscriptionPlan?: 'free' | 'plus' | 'premium' | 'ultimate';
}

interface UserContextType {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  onboardingComplete: boolean;
  setOnboardingComplete: (value: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData>({
    subscriptionPlan: 'free'
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  return (
    <UserContext.Provider
      value={{
        userData,
        setUserData,
        isLoggedIn,
        setIsLoggedIn,
        onboardingComplete,
        setOnboardingComplete,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
