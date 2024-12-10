import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photoUrl?: string;
  role: string;
}

interface UserContextType {
  userProfile: UserProfile;
  updateProfile: (profile: Partial<UserProfile>) => void;
}

const defaultProfile: UserProfile = {
  firstName: 'Syarah',
  lastName: 'Adela',
  email: 'syarah.adela@wewash.fr',
  phone: '+33 6 12 34 56 78',
  role: 'Propriétaire'
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultProfile);

  const updateProfile = (newProfile: Partial<UserProfile>) => {
    setUserProfile(current => ({
      ...current,
      ...newProfile
    }));
  };

  return (
    <UserContext.Provider value={{ userProfile, updateProfile }}>
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
