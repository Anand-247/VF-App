"use client"

import { useState } from "react"
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image } from "react-native"
import { Text, TextInput, Button, Card } from "react-native-paper"
import { LinearGradient } from "expo-linear-gradient"
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { useAuth } from "../../context/AuthContext"
import { theme, spacing, shadows } from "../../theme/theme"

export default function LoginScreen() {
  const [email, setEmail] = useState("admin@furniturestore.com")
  const [password, setPassword] = useState("admin123")
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const { login, loading } = useAuth()

  const validateForm = () => {
    const newErrors = {}

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email is invalid"
    }

    if (!password.trim()) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLogin = async () => {
    if (!validateForm()) return

    const result = await login(email, password)
    if (!result.success) {
      setErrors({ general: result.message })
    }
  }

  return (
    <LinearGradient colors={[theme.colors.primary, theme.colors.secondary]} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.keyboardView}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.logoContainer}>
            <Image source={require("../../../assets/logo.png")} style={styles.logo} />
            <Text style={styles.logoText}>Verma Furniture Works</Text>
            <Text style={styles.logoSubtext}>Admin Panel</Text>
          </View>

          <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
              <Text style={styles.title}>Welcome Back</Text>
              <Text style={styles.subtitle}>Sign in to your admin accout</Text>

              {errors.general && <Text style={styles.errorText}>{errors.general}</Text>}

              <TextInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                mode="outlined"
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                error={!!errors.email}
                left={<TextInput.Icon icon="email" />}
              />
              {errors.email && <Text style={styles.fieldError}>{errors.email}</Text>}

              <TextInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                mode="outlined"
                style={styles.input}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoComplete="password"
                error={!!errors.password}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />
              {errors.password && <Text style={styles.fieldError}>{errors.password}</Text>}

              <Button
                mode="contained"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                style={styles.loginButton}
                contentStyle={styles.loginButtonContent}
              >
                {loading ? "Signing In..." : "Sign In"}
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: spacing.xxl,
  },
  logoText: {
    fontSize: 26,
    fontWeight: "bold",
    color: theme.colors.onPrimary,
    marginTop: spacing.md,
  },
  logoSubtext: {
    fontSize: 16,
    color: theme.colors.onPrimary,
    opacity: 0.8,
    marginTop: spacing.xs,
  },
  card: {
    backgroundColor: theme.colors.surface,
    ...shadows.large,
  },
  cardContent: {
    padding: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: theme.colors.primary,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.onSurfaceVariant,
    textAlign: "center",
    marginBottom: spacing.lg,
  },
  input: {
    marginBottom: spacing.sm,
  },
  errorText: {
    color: theme.colors.error,
    textAlign: "center",
    marginBottom: spacing.md,
    fontSize: 14,
  },
  fieldError: {
    color: theme.colors.error,
    fontSize: 12,
    marginTop: -spacing.sm,
    marginBottom: spacing.sm,
    marginLeft: spacing.sm,
  },
  loginButton: {
    marginTop: spacing.lg,
    backgroundColor: theme.colors.primary,
  },
  loginButtonContent: {
    paddingVertical: spacing.sm,
  },
  logo: {
    width: 100,
    height: 100,
  },
})
