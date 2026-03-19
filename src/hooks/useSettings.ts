import { useState, useEffect, useCallback } from 'react';
import { Batch, SubjectFee } from '../types';
import { MOCK_BATCHES, MOCK_SUBJECT_FEES } from '../constants';

const SETTINGS_STORAGE_KEY = 'coaching_pro_settings';

export interface EmailJsConfig {
  serviceId: string;
  templateId: string;
  publicKey: string;
  contactEmail: string;
}

interface SettingsState {
  batches: Batch[];
  subjectFees: SubjectFee[];
  emailJsConfig: EmailJsConfig;
  disqusShortname?: string;
}

function loadSettings(): SettingsState {
  try {
    const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load settings from localStorage:', e);
  }
  
  // First load: seed with mock data
  const defaultState: SettingsState = {
    batches: MOCK_BATCHES,
    subjectFees: MOCK_SUBJECT_FEES,
    emailJsConfig: { serviceId: '', templateId: '', publicKey: '', contactEmail: '' },
    disqusShortname: '',
  };
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultState));
  return defaultState;
}

function saveSettings(settings: SettingsState): void {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save settings to localStorage:', e);
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<SettingsState>(loadSettings);

  // Persist whenever the settings change
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // Sync state across tabs
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SETTINGS_STORAGE_KEY && e.newValue) {
        setSettings(JSON.parse(e.newValue));
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Batch operations
  const addBatch = useCallback((batch: Omit<Batch, 'id'>) => {
    setSettings((prev) => {
      const newBatch: Batch = {
        ...batch,
        id: `BAT-${Date.now()}`
      };
      return { ...prev, batches: [...prev.batches, newBatch] };
    });
  }, []);

  const deleteBatch = useCallback((id: string) => {
    setSettings((prev) => ({
      ...prev,
      batches: prev.batches.filter(b => b.id !== id)
    }));
  }, []);

  // Subject Fee operations
  const addSubjectFee = useCallback((subjectFee: Omit<SubjectFee, 'id'>) => {
    setSettings((prev) => {
      const newSubjectFee: SubjectFee = {
        ...subjectFee,
        id: `SUB-${Date.now()}`
      };
      return { ...prev, subjectFees: [...prev.subjectFees, newSubjectFee] };
    });
  }, []);

  const updateSubjectFee = useCallback((updatedFee: SubjectFee) => {
    setSettings((prev) => ({
      ...prev,
      subjectFees: prev.subjectFees.map(sf => sf.id === updatedFee.id ? updatedFee : sf)
    }));
  }, []);

  const deleteSubjectFee = useCallback((id: string) => {
    setSettings((prev) => ({
      ...prev,
      subjectFees: prev.subjectFees.filter(sf => sf.id !== id)
    }));
  }, []);

  const setAllSettings = useCallback((newBatches: Batch[], newSubjectFees: SubjectFee[]) => {
    setSettings(prev => ({ ...prev, batches: newBatches, subjectFees: newSubjectFees }));
  }, []);

  const updateEmailJsConfig = useCallback((config: EmailJsConfig) => {
    setSettings(prev => ({ ...prev, emailJsConfig: config }));
  }, []);

  const updateDisqusShortname = useCallback((shortname: string) => {
    setSettings(prev => ({ ...prev, disqusShortname: shortname }));
  }, []);

  return {
    batches: settings.batches,
    subjectFees: settings.subjectFees,
    emailJsConfig: settings.emailJsConfig || { serviceId: '', templateId: '', publicKey: '', contactEmail: '' },
    disqusShortname: settings.disqusShortname || '',
    addBatch,
    deleteBatch,
    addSubjectFee,
    updateSubjectFee,
    deleteSubjectFee,
    setAllSettings,
    updateEmailJsConfig,
    updateDisqusShortname,
  };
}
