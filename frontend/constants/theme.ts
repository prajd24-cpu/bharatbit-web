// BharatBit Official Color Theme (from screenshot)
export const theme = {
  colors: {
    // Primary Background - Dark Navy
    background: '#0A0F1A',
    backgroundSecondary: '#273A52',    // BharatBit Navy Blue
    backgroundTertiary: '#1A2332',
    
    // BharatBit Primary Colors (from screenshot)
    primary: '#E54444',        // BharatBit Orange-Red (Primary button)
    primaryDark: '#C93939',
    primaryLight: '#FF5555',
    accent: '#F5B8A4',         // BharatBit Peach (Secondary button)
    accentDark: '#E5A894',
    accentLight: '#FFC8B4',
    
    // Additional Brand Colors
    cream: '#FDF4E3',          // Light cream accent
    navyBlue: '#273A52',       // Brand navy blue
    
    // Text Colors
    textPrimary: '#FFFFFF',
    textSecondary: '#CBD5E1',
    textMuted: '#94A3B8',
    textDark: '#1c1c1c',
    
    // Status Colors
    success: '#10B981',
    successLight: '#34D399',
    error: '#E54444',          // Using BharatBit primary for errors
    errorLight: '#FF5555',
    warning: '#F59E0B',
    info: '#3B82F6',
    
    // Borders & Dividers
    border: 'rgba(229, 68, 68, 0.2)',
    borderLight: 'rgba(148, 163, 184, 0.1)',
    divider: 'rgba(148, 163, 184, 0.1)',
    
    // Cards & Surfaces
    card: '#1E293B',
    cardHover: '#2D3B4E',
    
    // Overlay
    overlay: 'rgba(10, 22, 40, 0.95)',
    overlayLight: 'rgba(10, 22, 40, 0.7)',
    
    // Legacy gold references (now using BharatBit primary)
    gold: '#E54444',
    goldDark: '#C93939',
    goldLight: '#FF5555',
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
      shadowColor: '#E54444',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
  },
};

export type Theme = typeof theme;
