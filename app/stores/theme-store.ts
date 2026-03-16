import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  /** Current color theme */
  theme: 'light' | 'dark';
  /** Purple intensity slider value (0-150) */
  purpleIntensity: number;
  /** Font size zoom level index (0-4) */
  fontSizeLevel: number;
  /** Whether dyslexia-friendly font is enabled */
  dyslexiaFont: boolean;
  /** Whether reduced motion is enabled */
  reducedMotion: boolean;
  /** Whether high contrast mode is enabled */
  highContrast: boolean;
  /** Whether icon labels are shown */
  iconLabels: boolean;

  toggleTheme: () => void;
  setPurpleIntensity: (value: number) => void;
  cycleFontSize: () => void;
  setFontSizeLevel: (value: number) => void;
  toggleDyslexiaFont: () => void;
  toggleReducedMotion: () => void;
  toggleHighContrast: () => void;
  toggleIconLabels: () => void;
}

/** Theme and accessibility settings store, persisted to localStorage */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      purpleIntensity: 100,
      fontSizeLevel: 0,
      dyslexiaFont: false,
      reducedMotion: false,
      highContrast: false,
      iconLabels: false,

      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      setPurpleIntensity: (value) => set({ purpleIntensity: value }),
      cycleFontSize: () => set((s) => ({ fontSizeLevel: (s.fontSizeLevel + 1) % 5 })),
      setFontSizeLevel: (value) => set({ fontSizeLevel: value }),
      toggleDyslexiaFont: () => set((s) => ({ dyslexiaFont: !s.dyslexiaFont })),
      toggleReducedMotion: () => set((s) => ({ reducedMotion: !s.reducedMotion })),
      toggleHighContrast: () => set((s) => ({ highContrast: !s.highContrast })),
      toggleIconLabels: () => set((s) => ({ iconLabels: !s.iconLabels })),
    }),
    {
      name: 'medici-theme',
      version: 1,
      migrate: (persisted: any, version: number) => {
        if (version === 0) {
          persisted.purpleIntensity = 100;
        }
        return persisted;
      },
    }
  )
);
