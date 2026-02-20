import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { theme } from '../constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  style,
}) => {
  const buttonStyles: ViewStyle[] = [styles.button, styles[`${size}Size`], styles[`${variant}Variant`]];
  const textStyles: TextStyle[] = [styles.text, styles[`${size}Text`], styles[`${variant}Text`]];

  if (disabled || loading) {
    buttonStyles.push(styles.disabled);
  }

  if (style) {
    buttonStyles.push(style);
  }

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? theme.colors.gold : theme.colors.background} />
      ) : (
        <Text style={textStyles}>{title}</Text>
      )}
    </TouchableOpacity>
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
    backgroundColor: theme.colors.gold,
    ...theme.shadows.gold,
  },
  secondaryVariant: {
    backgroundColor: theme.colors.card,
    ...theme.shadows.md,
  },
  outlineVariant: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: theme.colors.gold,
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
