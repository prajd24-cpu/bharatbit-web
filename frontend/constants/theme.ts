// BharatBit Light Theme - White & Orange
export const theme = {
  colors: {
    // Light Background
    background: '#FFFFFF',           // Pure white
    backgroundSecondary: '#F8F9FA',  // Light grey
    backgroundTertiary: '#F1F3F5',
    
    // BharatBit Brand Colors
    primary: '#E54444',              // Orange-Red (buttons)
    primaryDark: '#C93939',
    primaryLight: '#FF5555',
    accent: '#F5B8A4',               // Peach
    accentDark: '#E5A894',
    accentLight: '#FFC8B4',
    
    // Navy Blue for text
    navyBlue: '#273A52',             // Dark navy blue
    textPrimary: '#273A52',          // Navy blue text
    textSecondary: '#5A6C7D',        // Lighter navy
    textMuted: '#8B95A0',
    textDark: '#1A2332',
    
    // White text (for buttons)
    textWhite: '#FFFFFF',
    
    // Status Colors
    success: '#10B981',
    successLight: '#34D399',
    error: '#E54444',
    errorLight: '#FF5555',
    warning: '#F59E0B',
    info: '#3B82F6',
    
    // Borders & Dividers
    border: 'rgba(229, 68, 68, 0.2)',
    borderLight: 'rgba(39, 58, 82, 0.1)',
    divider: 'rgba(39, 58, 82, 0.1)',
    
    // Cards & Surfaces
    card: '#FFFFFF',
    cardHover: '#F8F9FA',
    
    // Overlay
    overlay: 'rgba(255, 255, 255, 0.95)',
    overlayLight: 'rgba(255, 255, 255, 0.7)',
    
    // Legacy gold references (now using orange)
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
      shadowOpacity: 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
    primary: {
      shadowColor: '#E54444',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 12,
      elevation: 6,
    },
  },
};

export type Theme = typeof theme;
