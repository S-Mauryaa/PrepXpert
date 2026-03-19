import { useState, useEffect, useCallback } from 'react';
import { AdminProfile } from '../types';

const STORAGE_KEY = 'coaching_pro_adminProfile';

const DEFAULT_PROFILE: AdminProfile = {
  name: 'ABHISHEK MAURYA',
  role: 'Administrator',
  photoUrl: '', // Allow it to be empty and fallback to an avatar icon
};

function loadAdminProfile(): AdminProfile {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load admin profile from localStorage:', e);
  }
  // First load: seed with default
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_PROFILE));
  return DEFAULT_PROFILE;
}

function saveAdminProfile(profile: AdminProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save admin profile to localStorage:', e);
  }
}

export function useAdminProfile() {
  const [adminProfile, setAdminProfileState] = useState<AdminProfile>(loadAdminProfile);

  // Persist whenever the profile changes
  useEffect(() => {
    saveAdminProfile(adminProfile);
  }, [adminProfile]);

  // Sync state across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        setAdminProfileState(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateAdminProfile = useCallback((profileData: Partial<AdminProfile>) => {
    setAdminProfileState(prev => ({ ...prev, ...profileData }));
  }, []);

  return {
    adminProfile,
    updateAdminProfile,
  };
}
