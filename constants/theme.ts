/**
 * Seamless Design System
 * 
 * A cohesive design system built around a premium dark blue and golden palette
 * that feels calm, trustworthy, and seamless.
 */

import { Platform } from 'react-native';

// Color Palette
export const colors = {
  // Primary backgrounds
  background: '#2f4964',        // Dark blue - primary background, large surfaces
  backgroundAlt: '#16304a',      // Very dark navy - app bars, cards background in dark mode, headers
  
  // Accents
  accent: '#bc9e5e',             // Golden - primary accent: CTAs, focus states, key icons
  accentSecondary: '#ebd085',    // Light sand - secondary accent: highlights, pills, subtle backgrounds
  
  // Neutral
  neutral: '#c9c9c9',            // Soft, warm gray - borders, labels, disabled states
  
  // Text
  textPrimary: '#f5f5f5',        // Off-white for primary text on dark backgrounds
  textSecondary: '#d4d4d4',       // Light gray for secondary text
  textTertiary: '#a3a3a3',       // Muted gray for tertiary text
  textOnAccent: '#16304a',        // Dark navy text on golden backgrounds
  
  // Surface & Cards
  surface: '#2f4964',            // Card backgrounds (same as background)
  surfaceElevated: '#3a5a7a',     // Elevated cards (slightly lighter)
  surfaceHeader: '#16304a',      // Header/app bar background
  
  // Borders & Dividers
  border: 'rgba(201, 201, 201, 0.2)',      // Subtle borders
  borderStrong: 'rgba(201, 201, 201, 0.4)', // Stronger borders
  divider: 'rgba(201, 201, 201, 0.15)',    // Dividers
  
  // States
  success: '#10b981',            // Green for success states
  error: '#ef4444',              // Red for errors (desaturated)
  warning: '#f59e0b',            // Amber for warnings
  info: '#3b82f6',               // Blue for info
  
  // Interactive states
  pressed: 'rgba(188, 158, 94, 0.2)',      // Golden overlay for pressed states
  disabled: 'rgba(201, 201, 201, 0.3)',    // Disabled state
  focus: '#bc9e5e',                        // Focus ring color
  
  // Shadows
  shadow: 'rgba(0, 0, 0, 0.3)',
  shadowLight: 'rgba(0, 0, 0, 0.15)',
} as const;

// Spacing tokens (4px base unit)
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

// Typography
export const typography = {
  fontFamily: Platform.select({
    ios: 'system-ui',
    android: 'sans-serif',
    web: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    default: 'sans-serif',
  }),
  
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 22,
    '3xl': 24,
    '4xl': 32,
  },
  
  fontWeight: {
    normal: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },
} as const;

// Border radius tokens
export const radius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 24,
  full: 9999,
} as const;

// Animation timing
export const animation = {
  fast: 150,
  normal: 200,
  slow: 300,
  easing: {
    easeInOut: 'ease-in-out',
    easeOut: 'ease-out',
    easeIn: 'ease-in',
  },
} as const;

// Elevation/shadow presets
export const elevation = {
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  md: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  xl: {
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 12,
  },
} as const;

// Breakpoints for responsive design (web)
export const breakpoints = {
  mobile: 0,
  tablet: 768,
  desktop: 1200,
} as const;

// Max content width for web
export const maxContentWidth = 1200;

// Legacy compatibility (for gradual migration)
export const Colors = {
  light: {
    text: colors.textPrimary,
    background: colors.background,
    tint: colors.accent,
    icon: colors.textSecondary,
    tabIconDefault: colors.textTertiary,
    tabIconSelected: colors.accent,
  },
  dark: {
    text: colors.textPrimary,
    background: colors.background,
    tint: colors.accent,
    icon: colors.textSecondary,
    tabIconDefault: colors.textTertiary,
    tabIconSelected: colors.accent,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
