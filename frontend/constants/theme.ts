// BharatBit Official Color Theme
export const theme = {
  colors: {
    // Primary Background - Dark
    background: '#0A0F1A',
    backgroundSecondary: '#1A1F2E',
    backgroundTertiary: '#0F172A',
    
    // BharatBit Primary Colors
    primary: '#1a9c5d',        // BharatBit Green
    primaryDark: '#158750',
    primaryLight: '#22b86d',
    accent: '#d64545',         // BharatBit Red
    accentDark: '#b83939',
    accentLight: '#e05555',
    
    // Text Colors (from BharatBit website)
    textPrimary: '#ffffff',
    textSecondary: '#8a8a8a',
    textMuted: '#64748B',
    textDark: '#1c1c1c',
    
    // Status Colors (matching BharatBit)
    success: '#1a9c5d',        // BharatBit Green
    successLight: '#22b86d',
    error: '#d64545',          // BharatBit Red
    errorLight: '#e05555',
    warning: '#F59E0B',
    info: '#3B82F6',
    
    // Borders & Dividers
    border: 'rgba(26, 156, 93, 0.2)',
    borderLight: 'rgba(148, 163, 184, 0.1)',
    divider: 'rgba(148, 163, 184, 0.1)',
    
    // Cards & Surfaces
    card: '#1E293B',
    cardHover: '#2D3B4E',
    
    // Overlay
    overlay: 'rgba(10, 22, 40, 0.95)',
    overlayLight: 'rgba(10, 22, 40, 0.7)',
    
    // Legacy gold references (now using green)
    gold: '#1a9c5d',
    goldDark: '#158750',
    goldLight: '#22b86d',
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },
  
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
    xxxl: 40,
  },
  
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
    primary: {
      shadowColor: '#1a9c5d',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
  },
};

export type Theme = typeof theme;
