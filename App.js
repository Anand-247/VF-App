"use client"
import { NavigationContainer } from "@react-navigation/native"
import { createStackNavigator } from "@react-navigation/stack"
import { Provider as PaperProvider } from "react-native-paper"
import Toast from "react-native-toast-message"
import { StatusBar } from "expo-status-bar"
import { AuthProvider } from "./src/context/AuthContext"
import { LoadingProvider } from "./src/context/LoadingContext"
import AuthNavigator from "./src/navigation/AuthNavigator"
import MainNavigator from "./src/navigation/MainNavigator"
import LoadingScreen from "./src/components/LoadingScreen"
import { theme } from "./src/theme/theme"
import { useAuth } from "./src/context/AuthContext"
import { useEffect } from "react"
import * as NavigationBar from "expo-navigation-bar"
import { SafeAreaView } from "react-native-safe-area-context"

const Stack = createStackNavigator()

function AppContent() {
  const { user, loading } = useAuth()

  useEffect(() => {
  }, [user])

  if (loading) {
    return <LoadingScreen />
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" backgroundColor={theme.colors.primary} />
      {user ? <MainNavigator /> : <AuthNavigator />}
      <Toast />
    </NavigationContainer>
  )
}

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <LoadingProvider>
        <AuthProvider>
          <SafeAreaView 
            style={{ flex: 1, backgroundColor: theme.colors.background }}
            edges={['left', 'right', 'bottom']} // Exclude 'top' to avoid header conflicts
          >
            <AppContent />
          </SafeAreaView>
        </AuthProvider>
      </LoadingProvider>
    </PaperProvider>
  )
}
