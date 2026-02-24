import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, Platform } from 'react-native';
import { theme } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
  testID,
}) => {
  const buttonStyles: ViewStyle[] = [styles.button, styles[`${size}Size`], styles[`${variant}Variant`]];
  const textStyles: TextStyle[] = [styles.text, styles[`${size}Text`], styles[`${variant}Text`]];

  if (disabled || loading) {
    buttonStyles.push(styles.disabled);
  }

  if (style) {
    buttonStyles.push(style);
  }

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  // For web, use a native button element for better compatibility
  if (Platform.OS === 'web') {
    return (
      <button
        type="button"
        onClick={handlePress}
        disabled={disabled || loading}
        data-testid={testID}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 12,
          border: variant === 'outline' ? `1.5px solid ${theme.colors.primary}` : 'none',
          backgroundColor: disabled || loading 
            ? '#ccc' 
            : variant === 'outline' 
              ? 'transparent' 
              : variant === 'danger'
                ? theme.colors.error
                : variant === 'secondary'
                  ? theme.colors.card
                  : theme.colors.primary,
          paddingLeft: size === 'sm' ? 16 : size === 'lg' ? 32 : 24,
          paddingRight: size === 'sm' ? 16 : size === 'lg' ? 32 : 24,
          paddingTop: size === 'sm' ? 10 : size === 'lg' ? 18 : 14,
          paddingBottom: size === 'sm' ? 10 : size === 'lg' ? 18 : 14,
          minHeight: size === 'sm' ? 36 : size === 'lg' ? 56 : 48,
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
          opacity: disabled || loading ? 0.5 : 1,
          transition: 'all 0.2s ease',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          fontSize: size === 'sm' ? 14 : size === 'lg' ? 18 : 16,
          fontWeight: 600,
          color: variant === 'outline' 
            ? theme.colors.primary 
            : variant === 'secondary'
              ? theme.colors.textPrimary
              : '#fff',
          boxShadow: variant === 'primary' && !disabled && !loading 
            ? '0 4px 14px rgba(233, 87, 33, 0.3)' 
            : 'none',
          width: '100%',
          boxSizing: 'border-box' as const,
        }}
      >
        {loading ? 'Loading...' : title}
      </button>
    );
  }

  return (
    <Pressable
      style={({ pressed }) => [
        ...buttonStyles,
        pressed && { opacity: 0.7 }
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      testID={testID}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? theme.colors.gold : theme.colors.background} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.md,
    flexDirection: 'row',
  },
  
  // Sizes
  smSize: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    minHeight: 36,
  },
  mdSize: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    minHeight: 48,
  },
  lgSize: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    minHeight: 56,
  },
  
  // Variants
  primaryVariant: {
    backgroundColor: theme.colors.primary,
    ...theme.shadows.primary,
  },
  secondaryVariant: {
    backgroundColor: theme.colors.card,
    ...theme.shadows.md,
  },
  outlineVariant: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
  },
  dangerVariant: {
    backgroundColor: theme.colors.error,
    ...theme.shadows.md,
  },
  
  // Text styles
  text: {
    fontWeight: theme.fontWeight.semibold,
  },
  smText: {
    fontSize: theme.fontSize.sm,
  },
  mdText: {
    fontSize: theme.fontSize.md,
  },
  lgText: {
    fontSize: theme.fontSize.lg,
  },
  
  // Text variants
  primaryText: {
    color: theme.colors.background,
  },
  secondaryText: {
    color: theme.colors.textPrimary,
  },
  outlineText: {
    color: theme.colors.gold,
  },
  dangerText: {
    color: theme.colors.textPrimary,
  },
  
  disabled: {
    opacity: 0.5,
  },
});
