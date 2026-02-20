// Premium Banking Theme - Royal Blue & Orange
export const theme = {
  colors: {
    // Primary Background - Deep Navy & Dark Blue
    background: '#0A1628',
    backgroundSecondary: '#1A1F2E',
    backgroundTertiary: '#0F172A',
    
    // Royal Blue & Orange Accents
    primary: '#4169E1',        // Royal Blue
    primaryDark: '#2C4A9C',
    primaryLight: '#6B8FE8',
    accent: '#FF6B35',         // Orange
    accentDark: '#E55A2B',
    accentLight: '#FF8C5F',
    
    // Text
    textPrimary: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    
    // Status Colors
    success: '#10B981',
    successLight: '#34D399',
    error: '#EF4444',
    errorLight: '#F87171',
    warning: '#F59E0B',
    info: '#3B82F6',
    
    // Borders & Dividers
    border: 'rgba(65, 105, 225, 0.2)',
    borderLight: 'rgba(148, 163, 184, 0.1)',
    divider: 'rgba(148, 163, 184, 0.1)',
    
    // Cards & Surfaces
    card: '#1E293B',
    cardHover: '#2D3B4E',
    
    // Overlay
    overlay: 'rgba(10, 22, 40, 0.95)',
    overlayLight: 'rgba(10, 22, 40, 0.7)',
    
    // Legacy gold references (now using royal blue)
    gold: '#4169E1',
    goldDark: '#2C4A9C',
    goldLight: '#6B8FE8',
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
      shadowColor: '#4169E1',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
  },
};

export type Theme = typeof theme;
