"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { getApiBase, hasExplicitApiBase } from "@/lib/api-base"

const API_BASE = getApiBase()
const MISSING_API_BASE = !hasExplicitApiBase()

function getServerReachabilityMessage(): string {
  if (typeof window !== "undefined" && window.location.hostname !== "localhost" && MISSING_API_BASE) {
    return "Cannot reach server. Configure VITE_API_BASE to your backend URL."
  }
  return "Cannot reach server. Is the backend server running?"
}

type User = {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  profilePic?: string
  role: "user" | "admin"
  isNewSignup?: boolean
  addresses?: any[]
}

type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; message?: string }>
  signup: (email: string, password: string, firstName: string, lastName: string, phone: string, termsAccepted: boolean) => Promise<{ success: boolean; user?: User; message?: string }>
  updateProfile: (data: { firstName: string; lastName: string; phone: string; profilePic?: string }) => Promise<{ success: boolean; message: string }>
  logout: () => void
  loginWithGoogle: () => void
  refreshUser: () => Promise<User | null>
  isAuthenticated: boolean
  isAdmin: boolean
  isAuthLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const SESSION_USER_KEY = "auth_user_session"

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null
    try {
      const raw = sessionStorage.getItem(SESSION_USER_KEY)
      return raw ? (JSON.parse(raw) as User) : null
    } catch {
      return null
    }
  })
  const [isAuthLoading, setIsAuthLoading] = useState(true)

  const restoreUserFromSession = async (): Promise<User | null> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/user`, {
        credentials: "include",
      })
      if (res.ok) {
        const data = await res.json()
        if (data.user) {
          const restored: User = {
            id: data.id || "",
            email: data.user,
            firstName: data.firstName || data.user.split("@")[0],
            lastName: data.lastName || "",
            phone: data.phone || "",
            profilePic: data.profilePic || "",
            role: data.isAdmin ? "admin" : "user",
            isNewSignup: data.isNewSignup || false,
            addresses: data.addresses || [],
          }
          setUser(restored)
          sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(restored))
          return restored
        }
      }
      setUser(null)
      sessionStorage.removeItem(SESSION_USER_KEY)
      return null
    } catch {
      // Backend not reachable - keep sessionStorage snapshot for this tab
      return user
    }
  }

  // On mount: restore session from backend server
  useEffect(() => {
    const restore = async () => {
      try {
        await restoreUserFromSession()
      } finally {
        setIsAuthLoading(false)
      }
    }
    restore()
  }, [])

  const refreshUser = async (): Promise<User | null> => {
    setIsAuthLoading(true)
    try {
      return await restoreUserFromSession()
    } finally {
      setIsAuthLoading(false)
    }
  }

  const login = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; user?: User; message?: string }> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim().toLowerCase(), password }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        const loggedIn: User = {
          id: data.id || "",
          email: data.user || email,
          firstName: data.firstName || email.split("@")[0],
          lastName: data.lastName || "",
          phone: data.phone || "",
          profilePic: data.profilePic || "",
          role: data.isAdmin ? "admin" : "user",
          isNewSignup: data.isNewSignup || false,
          addresses: data.addresses || [],
        }
        setUser(loggedIn)
        sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(loggedIn))
        return { success: true, user: loggedIn }
      }

      return { success: false, message: data.error || "Invalid credentials" }
    } catch {
      return { success: false, message: getServerReachabilityMessage() }
    }
  }

  const signup = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    phone: string,
    termsAccepted: boolean
  ): Promise<{ success: boolean; user?: User; message?: string }> => {
    if (!email || !password) {
      return { success: false, message: "Email and password are required" }
    }
    if (password.length < 6) {
      return { success: false, message: "Password must be at least 6 characters" }
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim().toLowerCase(), password, firstName, lastName, phone, termsAccepted }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        const newUser: User = {
          id: data.id || "",
          email: data.user || email,
          firstName: firstName,
          lastName: lastName,
          phone: phone || data.phone || "",
          role: "user",
        }
        setUser(newUser)
        sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(newUser))
        // Clear stale local data for new user
        localStorage.removeItem("cart")
        localStorage.removeItem("wishlist")
        return { success: true, user: newUser }
      }

      return { success: false, message: data.error || "Unable to create account" }
    } catch {
      return { success: false, message: getServerReachabilityMessage() }
    }
  }

  const updateProfile = async (data: { firstName: string; lastName: string; phone: string; profilePic?: string }): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/user`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      })

      const json = await res.json()
      if (res.ok && json.success) {
        if (user) {
          const updatedUser = { ...user, ...data }
          setUser(updatedUser)
          sessionStorage.setItem(SESSION_USER_KEY, JSON.stringify(updatedUser))
        }
        return { success: true, message: json.message }
      }
      return { success: false, message: json.error || "Update failed" }
    } catch {
      return { success: false, message: "Network error" }
    }
  }

  const logout = async () => {
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      })
    } catch {
      // Ignore network errors on logout
    }
    setUser(null)
    sessionStorage.removeItem(SESSION_USER_KEY)
    // Clear stale local data on logout
    localStorage.removeItem("cart")
    localStorage.removeItem("wishlist")
  }

  const loginWithGoogle = () => {
    window.location.href = `${API_BASE}/api/auth/google/login`
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        signup,
        updateProfile,
        logout,
        loginWithGoogle,
        refreshUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
        isAuthLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
