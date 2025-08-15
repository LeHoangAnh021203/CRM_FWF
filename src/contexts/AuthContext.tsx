"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { AuthAPI, LoginRequest } from "@/lib/auth-api"
import { TokenService } from "@/lib/token-service"

interface User {
  id: number
  firstname: string
  lastname: string
  username: string
  email: string
  phoneNumber: string
  dob: string
  gender: boolean
  bio: string
  avatar: string | null
  role: string
  active: boolean
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  permissions: string[]
  isAdmin: boolean
  login: (username: string, password: string) => Promise<boolean>
  signup: (_email: string, _password: string, _name: string) => Promise<boolean>
  logout: () => void
  hasPermission: (permission: string) => boolean
  getValidToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [permissions, setPermissions] = useState<string[]>([])

  // Check if user is already logged in on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = await TokenService.getValidAccessToken()
        const userData = localStorage.getItem("user_data")
        
        if (token && userData) {
          try {
            const user = JSON.parse(userData)
            setUser(user)
            
            // Get permissions from token
            const userPermissions = AuthAPI.getUserPermissions(token)
            setPermissions(userPermissions)
          } catch (error) {
            console.error("Error parsing user data:", error)
            TokenService.clearTokens()
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        TokenService.clearTokens()
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const credentials: LoginRequest = { username, password }
      const response = await AuthAPI.login(credentials)
      
      // Store tokens and user data
      localStorage.setItem("access_token", response.access_token)
      localStorage.setItem("refresh_token", response.refresh_token)
      localStorage.setItem("user_data", JSON.stringify(response.user))
      
      // Get permissions from token
      const userPermissions = AuthAPI.getUserPermissions(response.access_token)
      setPermissions(userPermissions)
      
      setUser(response.user)
      return true
    } catch (error) {
      console.error("Login error:", error)
      return false
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const signup = async (_email: string, _password: string, _name: string): Promise<boolean> => {
    // For now, redirect to login since signup endpoint might not exist
    console.log("Signup not implemented yet")
    return false
  }

  const logout = async () => {
    try {
      // Call logout API first
      await AuthAPI.logout()
    } catch (error) {
      console.warn('Logout API failed, continuing with local logout:', error)
    } finally {
      // Always clear local tokens and state
      TokenService.clearTokens()
      setUser(null)
      setPermissions([])
    }
  }

  const hasPermission = (permission: string): boolean => {
    const token = localStorage.getItem("access_token")
    if (!token) return false
    return AuthAPI.hasPermission(token, permission)
  }

  const getValidToken = async (): Promise<string | null> => {
    return await TokenService.getValidAccessToken()
  }

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    permissions,
    isAdmin: permissions.includes('ROLE_ADMIN'),
    login,
    signup,
    logout,
    hasPermission,
    getValidToken
  }

  return (
    <AuthContext.Provider value={value}>
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
