import axios from "axios"
import AsyncStorage from "@react-native-async-storage/async-storage"
// import Constants from "expo-constants"

// Use your actual API URL here
// const API_BASE_URL = Constants.expoConfig?.extra?.apiUrl || "http://localhost:5000/api"
const API_BASE_URL = "https://be-vf.onrender.com/api"

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("adminToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      AsyncStorage.multiRemove(["adminToken", "adminUser"])
    }
    return Promise.reject(error)
  },
)

export const authAPI = {
  login: (email, password) => api.post("/auth/login", { email, password }),
}

export const categoriesAPI = {
  getAll: () => api.get("/categories"),
  getById: (id) => api.get(`/categories/${id}`),
  create: (data) => api.post("/categories", data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  update: (id, data) => api.put(`/categories/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  delete: (id) => api.delete(`/categories/${id}`),
}

export const productsAPI = {
  getAll: (params) => api.get("/products", { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) =>
    api.post("/products", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, data) =>
    api.put(`/products/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id) => api.delete(`/products/${id}`),
}

export const bannersAPI = {
  getAll: () => api.get("/banners"),
  getById: (id) => api.get(`/banners/${id}`),
  create: (data) => api.post("/banners", data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  update: (id, data) => api.put(`/banners/${id}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  delete: (id) => api.delete(`/banners/${id}`),
}

export const contactsAPI = {
  getAll: () => api.get("/contact"),
  delete: (id) => api.delete(`/contact/${id}`),
}

export const uploadAPI = {
  uploadImage: (formData) => {
    return api.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    })
  },
}

export default api
