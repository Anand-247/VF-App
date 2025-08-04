import { MD3LightTheme } from "react-native-paper"

export const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#6200EE",             // Vibrant purple
    primaryContainer: "#EADDFF",    // Light purple background
    secondary: "#03DAC6",           // Bright teal
    secondaryContainer: "#CFFAFA",  // Light teal background
    tertiary: "#BB86FC",            // Soft purple
    surface: "#FFFFFF",
    surfaceVariant: "#F0F2F5",      // Light grey
    background: "#F8F9FA",          // Off-white background
    error: "#B00020",               // Strong red
    success: "#4CAF50",             // Success green
    warning: "#FFC107",             // Warning yellow
    info: "#2196F3",                // Info blue
    onPrimary: "#FFFFFF",
    onSecondary: "#000000",
    onSurface: "#1C1B1F",
    onBackground: "#1C1B1F",
    outline: "#79747E",             // Grey border
  },
  roundness: 8,
  fonts: {
    ...MD3LightTheme.fonts,
    headlineLarge: {
      ...MD3LightTheme.fonts.headlineLarge,
      fontWeight: "700",
    },
    headlineMedium: {
      ...MD3LightTheme.fonts.headlineMedium,
      fontWeight: "600",
    },
    titleLarge: {
      ...MD3LightTheme.fonts.titleLarge,
      fontWeight: "600",
    },
    titleMedium: {
      ...MD3LightTheme.fonts.titleMedium,
      fontWeight: "500",
    },
    bodyLarge: {
      ...MD3LightTheme.fonts.bodyLarge,
      letterSpacing: 0.15,
    },
    bodyMedium: {
      ...MD3LightTheme.fonts.bodyMedium,
      letterSpacing: 0.25,
    },
    labelLarge: {
      ...MD3LightTheme.fonts.labelLarge,
      fontWeight: "500",
      letterSpacing: 0.1,
    },
  },
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
}

export const shadows = {
  small: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  medium: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6.27,
    elevation: 8,
  },
  large: {
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 10.32,
    elevation: 12,
  },
}
