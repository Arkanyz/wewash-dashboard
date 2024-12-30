import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '../lib/supabaseClient';

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
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
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

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserProfile({
            firstName: profile.first_name || defaultProfile.firstName,
            lastName: profile.last_name || defaultProfile.lastName,
            email: profile.email || defaultProfile.email,
            phone: profile.phone || defaultProfile.phone,
            photoUrl: profile.photo_url,
            role: profile.role || defaultProfile.role
          });
        }
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const updateProfile = async (newProfile: Partial<UserProfile>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const updates = {
          id: user.id,
          first_name: newProfile.firstName,
          last_name: newProfile.lastName,
          email: newProfile.email,
          phone: newProfile.phone,
          photo_url: newProfile.photoUrl,
          role: newProfile.role,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('profiles')
          .upsert(updates);

        if (error) throw error;

        setUserProfile(current => ({
          ...current,
          ...newProfile
        }));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
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
