// ============================================
// Configuration Constants
// ============================================
// All extracted config values, magic numbers, and
// reusable constants. Components import from here
// instead of hardcoding values.

import type { PurpleBaseColors, RGBCompanions } from '~/services/types';

// ============================================
// APP CONFIG
// ============================================

export const CONFIG = {
  /** Font zoom levels for accessibility font-size boost */
  fontZoomLevels: [1, 1.05, 1.1, 1.15, 1.2] as const,

  /** Memory fact categories for filtering */
  memoryCategories: ['all', 'preference', 'contact', 'fund', 'style', 'workflow'] as const,

  /** Lesson scope options */
  lessonScopes: ['all', 'user', 'company'] as const,

  /** Sidebar dimension breakpoints */
  sidebar: {
    narrowSnap: 56,
    narrowThreshold: 110,
  } as const,

  /** Knowledge graph animation duration (ms) */
  graphAnimMs: 500,

  /** Erabor streaming demo timing (ms) */
  eraborTimingMs: 2000,

  /** Flow graph layout dimensions */
  flowGraph: {
    nodeWidth: 160,
    nodeHeight: 60,
    compactNodeWidth: 100,
    compactNodeHeight: 36,
    colSpacing: 200,
    rowSpacing: 100,
    edgeStroke: 1.5,
  } as const,
} as const;

// ============================================
// PURPLE INTENSITY
// ============================================

/** Base color values for purple intensity slider (per theme) */
export const CONFIG_PURPLE_BASE_COLORS: PurpleBaseColors = {
  light: {
    '--berry-1': '#E0D0E1', '--berry-2': '#C4A6C5', '--berry-3': '#8B4F8D',
    '--berry-4': '#5D355E', '--berry-5': '#2E1A2F',
    '--violet-1': '#D8C8E2', '--violet-2': '#A383B4', '--violet-3': '#74418F',
    '--violet-4': '#4D2B5F', '--violet-5': '#271630',
    '--chinese-1': '#D8CAD9', '--chinese-2': '#A891AD', '--chinese-3': '#7F6485',
    '--chinese-4': '#4A2E50', '--chinese-5': '#2A182E',
  },
  dark: {
    '--berry-1': '#2e1f2f', '--berry-2': '#5a3a5c', '--berry-3': '#a860aa',
    '--berry-4': '#5D355E', '--berry-5': '#2E1A2F',
    '--violet-1': '#241a2f', '--violet-2': '#6a4a80', '--violet-3': '#8855a8',
    '--violet-4': '#4D2B5F', '--violet-5': '#271630',
    '--chinese-1': '#261a28', '--chinese-2': '#4e3854', '--chinese-3': '#8a6c92',
    '--chinese-4': '#4A2E50', '--chinese-5': '#2A182E',
  },
};

/** Map of CSS tokens that need an RGB triplet companion */
export const CONFIG_RGB_COMPANIONS: RGBCompanions = {
  '--violet-3': '--violet-3-rgb',
  '--berry-3': '--berry-3-rgb',
};
