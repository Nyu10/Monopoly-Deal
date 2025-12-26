import { createContext, useContext, useState, useEffect } from 'react';

/**
 * Settings Context for managing game preferences
 */
const SettingsContext = createContext(null);

/**
 * Default settings
 */
const DEFAULT_SETTINGS = {
  showBankValues: true, // Show opponent bank values
  showBankCards: true, // Show individual cards in bank
  soundEnabled: true,
  animationsEnabled: true,
  autoEndTurn: false,
};

/**
 * Settings Provider Component
 */
export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    // Load from localStorage on init
    const saved = localStorage.getItem('monopoly-deal-settings');
    if (saved) {
      try {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      } catch (e) {
        console.error('Failed to parse saved settings:', e);
        return DEFAULT_SETTINGS;
      }
    }
    return DEFAULT_SETTINGS;
  });

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem('monopoly-deal-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

/**
 * Hook to access settings
 */
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
