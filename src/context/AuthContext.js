import { createContext, useContext, useState, useEffect } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { authAPI } from "../services/api"
import Toast from "react-native-toast-message"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem("adminToken")
      const userData = await AsyncStorage.getItem("adminUser")

      if (token && userData) {
        setUser(JSON.parse(userData))
      }
    } catch (error) {
      console.error("Auth check error:", error)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      setLoading(true)
      const response = await authAPI.login(email, password)

      if (response.token && response.admin) {
        await AsyncStorage.setItem("adminToken", response.token)
        await AsyncStorage.setItem("adminUser", JSON.stringify(response.admin))
        setUser(response.admin)

        Toast.show({
          type: "success",
          text1: "Login Successful",
          text2: "Welcome back!",
        })

        return { success: true }
      } else {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: response.message || "Invalid credentials",
        })
        return { success: false, message: response.message }
      }
    } catch (error) {
      console.error("Login error:", error)
      Toast.show({
        type: "error",
        text1: "Login Error",
        text2: "Network error. Please try again.",
      })
      return { success: false, message: "Network error" }
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await AsyncStorage.multiRemove(["adminToken", "adminUser"])
      setUser(null)
      Toast.show({
        type: "success",
        text1: "Logged Out",
        text2: "See you soon!",
      })
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const value = {
    user,
    login,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
