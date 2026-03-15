// ============================================
// USE-THEME HOOK
// Applies theme state from Zustand store to the DOM.
// Called once at the top level (root.tsx) to handle
// dark mode, purple intensity, font size, and a11y attributes.
// ============================================

import { useEffect } from 'react';
import { useThemeStore } from '~/stores/theme-store';
import { adjustPurpleIntensity } from '~/lib/color-utils';
import { CONFIG, CONFIG_PURPLE_BASE_COLORS, CONFIG_RGB_COMPANIONS } from '~/data/config';

/**
 * Applies all theme and accessibility settings to the DOM.
 * Reads from the persisted Zustand theme store and uses useEffect
 * to sync changes to document.documentElement.
 *
 * Effects:
 * - Dark mode: toggles `.dark` class on `<html>`
 * - Purple intensity: adjusts violet/berry/chinese CSS custom properties
 * - Font size: sets root font-size based on zoom level
 * - A11y attributes: sets data-a11y-font, data-a11y-motion, data-a11y-contrast
 *
 * Call this hook once in root.tsx so it runs at the top level.
 */
export function useTheme(): void {
  const theme = useThemeStore((s) => s.theme);
  const purpleIntensity = useThemeStore((s) => s.purpleIntensity);
  const fontSizeLevel = useThemeStore((s) => s.fontSizeLevel);
  const dyslexiaFont = useThemeStore((s) => s.dyslexiaFont);
  const reducedMotion = useThemeStore((s) => s.reducedMotion);
  const highContrast = useThemeStore((s) => s.highContrast);

  // Dark mode — toggle .dark class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Purple intensity — adjust violet/berry/chinese CSS custom properties
  useEffect(() => {
    const root = document.documentElement;
    const baseColors = theme === 'dark'
      ? CONFIG_PURPLE_BASE_COLORS.dark
      : CONFIG_PURPLE_BASE_COLORS.light;

    const adjusted = adjustPurpleIntensity(baseColors, purpleIntensity, CONFIG_RGB_COMPANIONS);

    for (const [prop, value] of Object.entries(adjusted)) {
      root.style.setProperty(prop, value);
    }
  }, [theme, purpleIntensity]);

  // Font size — set root font-size from zoom level
  useEffect(() => {
    const root = document.documentElement;
    const fontSize = CONFIG.fontZoomLevels[fontSizeLevel];

    if (fontSize !== 1) {
      root.style.fontSize = `${fontSize}em`;
    } else {
      root.style.removeProperty('font-size');
    }
  }, [fontSizeLevel]);

  // Accessibility data attributes
  useEffect(() => {
    const root = document.documentElement;

    if (dyslexiaFont) {
      root.setAttribute('data-a11y-font', 'dyslexia');
    } else {
      root.removeAttribute('data-a11y-font');
    }

    if (reducedMotion) {
      root.setAttribute('data-a11y-motion', 'reduce');
    } else {
      root.removeAttribute('data-a11y-motion');
    }

    if (highContrast) {
      root.setAttribute('data-a11y-contrast', 'high');
    } else {
      root.removeAttribute('data-a11y-contrast');
    }
  }, [dyslexiaFont, reducedMotion, highContrast]);
}
