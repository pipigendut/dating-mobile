import React, { createContext, useState, useContext, ReactNode } from 'react';

export interface UserPhoto {
  url: string;
  isMain: boolean;
}

export interface UserData {
  authMethod?: 'google' | 'apple' | 'email';
  name?: string;
  birthDate?: string;
  email?: string;
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

interface UserContextType {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData>>;
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData>({
    subscriptionPlan: 'free'
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <UserContext.Provider
      value={{
        userData,
        setUserData,
        isLoggedIn,
        setIsLoggedIn,
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
