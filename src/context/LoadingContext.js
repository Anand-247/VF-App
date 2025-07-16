"use client"

import { createContext, useContext, useState } from "react"

const LoadingContext = createContext()

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error("useLoading must be used within a LoadingProvider")
  }
  return context
}

export const LoadingProvider = ({ children }) => {
  const [loading, setLoading] = useState(false)
  const [loadingText, setLoadingText] = useState("Loading...")

  const showLoading = (text = "Loading...") => {
    setLoadingText(text)
    setLoading(true)
  }

  const hideLoading = () => {
    setLoading(false)
  }

  const value = {
    loading,
    loadingText,
    showLoading,
    hideLoading,
  }

  return <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
}
