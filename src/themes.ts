// 2026 preset themes — modern, accessible, trend-aligned color schemes

import type { Theme, ThemeColors } from './types'

export const themes: Record<Theme, ThemeColors> = {
  // Dark theme (default) — classic developer dark mode
  dark: {
    bg: '#09090b',
    fg: '#e4e4e7',
    dim: '#71717a',
    human: '#22c55e',
    ai: '#a855f7',
    add: 'rgba(34, 102, 68, 0.25)',
    remove: 'rgba(185, 28, 28, 0.2)',
    border: '#27272a',
    borderSubtle: '#18181b'
  },

  // Light theme — clean, minimal
  light: {
    bg: '#ffffff',
    fg: '#18181b',
    dim: '#71717a',
    human: '#16a34a',
    ai: '#9333ea',
    add: 'rgba(22, 163, 74, 0.15)',
    remove: 'rgba(220, 38, 38, 0.12)',
    border: '#e4e4e7',
    borderSubtle: '#f4f4f5'
  },

  // Midnight — deep blue-black, cyberpunk adjacent
  midnight: {
    bg: '#030712',
    fg: '#e2e8f0',
    dim: '#64748b',
    human: '#06b6d4',
    ai: '#f472b6',
    add: 'rgba(6, 182, 212, 0.2)',
    remove: 'rgba(244, 114, 182, 0.15)',
    border: '#1e293b',
    borderSubtle: '#0f172a'
  },

  // Cyber — neon accents on near-black
  cyber: {
    bg: '#050505',
    fg: '#f0f0f0',
    dim: '#6b6b6b',
    human: '#00ff9f',
    ai: '#ff00ff',
    add: 'rgba(0, 255, 159, 0.2)',
    remove: 'rgba(255, 0, 255, 0.15)',
    border: '#2a2a2a',
    borderSubtle: '#0a0a0a'
  },

  // Forest — nature-inspired greens
  forest: {
    bg: '#0a1208',
    fg: '#d4e5d4',
    dim: '#5a6a5a',
    human: '#4ade80',
    ai: '#2dd4bf',
    add: 'rgba(74, 222, 128, 0.2)',
    remove: 'rgba(248, 113, 113, 0.15)',
    border: '#1a2a1a',
    borderSubtle: '#0a180a'
  },

  // Sunset — warm tones, easy on eyes
  sunset: {
    bg: '#0f0808',
    fg: '#f5e6e6',
    dim: '#7a5a5a',
    human: '#fb923c',
    ai: '#f43f5e',
    add: 'rgba(251, 146, 60, 0.2)',
    remove: 'rgba(244, 63, 94, 0.15)',
    border: '#2a1a1a',
    borderSubtle: '#1a0a0a'
  }
}

// Generate CSS variables from theme colors
export function themeToVars(theme: ThemeColors): Record<string, string> {
  return {
    '--trace-bg': theme.bg,
    '--trace-fg': theme.fg,
    '--trace-dim': theme.dim,
    '--trace-human': theme.human,
    '--trace-ai': theme.ai,
    '--trace-add': theme.add,
    '--trace-remove': theme.remove,
    '--trace-border': theme.border,
    '--trace-border-subtle': theme.borderSubtle
  }
}
