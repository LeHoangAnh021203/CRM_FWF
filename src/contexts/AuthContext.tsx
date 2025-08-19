"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { AuthAPI, LoginRequest } from "@/lib/auth-api"
import { TokenService } from "@/lib/token-service"
import { MockAuthService } from "@/lib/mock-auth"

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
        
        console.log('[AuthContext] Initializing auth...')
        console.log('[AuthContext] Token exists:', !!token)
        console.log('[AuthContext] User data exists:', !!userData)
        console.log('[AuthContext] Current pathname:', window.location.pathname)
        
        if (token && userData) {
          try {
            const user = JSON.parse(userData)
            console.log('[AuthContext] Setting user from localStorage:', user)
            setUser(user)
            
            // Also ensure token is in cookie for middleware
            if (typeof document !== 'undefined') {
              document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`
              console.log('[AuthContext] Token saved to cookie for middleware access')
            }
            
            // Get permissions from token with error handling
            try {
              const userPermissions = AuthAPI.getUserPermissions(token)
              setPermissions(userPermissions)
              console.log('[AuthContext] Permissions loaded from token:', userPermissions)
            } catch (permissionError) {
              console.warn('[AuthContext] Error getting permissions from token, using empty array:', permissionError)
              setPermissions([])
            }
          } catch (error) {
            console.error("Error parsing user data:", error)
            TokenService.clearTokens()
          }
        }
      } catch (error) {
        console.error("Error initializing auth:", error)
        TokenService.clearTokens()
      } finally {
        // Giảm delay để đảm bảo state được cập nhật nhanh hơn
        setTimeout(() => {
          setIsLoading(false)
        }, 50)
      }
    }

    initializeAuth()
  }, [])

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log('[AuthContext] Starting login process...');
      
      // Check if mock auth is enabled
      if (MockAuthService.isActive()) {
        console.log('[AuthContext] Using MOCK authentication...');
        const response = await MockAuthService.login(username, password)
        
        console.log('[AuthContext] Mock login successful');
        console.log('[AuthContext] Response received:', response);
        
        // Store tokens and user data
        localStorage.setItem("access_token", response.access_token)
        localStorage.setItem("refresh_token", response.refresh_token)
        localStorage.setItem("user_data", JSON.stringify(response.user))
        
        // Also store token in cookie for middleware access
        document.cookie = `token=${response.access_token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`
        
        console.log('[AuthContext] Mock tokens stored, setting user state...')
        console.log('[AuthContext] User data:', response.user)
        
        // Set user state immediately
        setUser(response.user)
        
        // Get permissions from token with error handling
        try {
          console.log('[AuthContext] Getting user permissions...');
          const userPermissions = MockAuthService.getUserPermissions(response.access_token)
          setPermissions(userPermissions)
          console.log('[AuthContext] Permissions set:', userPermissions)
        } catch (permissionError) {
          console.warn('[AuthContext] Error getting permissions, using empty array:', permissionError)
          setPermissions([])
        }
        
        console.log('[AuthContext] Mock login completed successfully');
        
        // Giảm delay để đảm bảo state được cập nhật nhanh hơn
        await new Promise(resolve => setTimeout(resolve, 50));
        
        return true
      }
      
      // Use real API if mock is not enabled
      const credentials: LoginRequest = { username, password }
      console.log('[AuthContext] Calling AuthAPI.login...');
      const response = await AuthAPI.login(credentials)
      
      console.log('[AuthContext] AuthAPI.login completed successfully');
      console.log('[AuthContext] Response received:', response);
      console.log('[AuthContext] Login successful, storing tokens...')
      
      // Store tokens and user data
      localStorage.setItem("access_token", response.access_token)
      localStorage.setItem("refresh_token", response.refresh_token)
      localStorage.setItem("user_data", JSON.stringify(response.user))
      
      // Also store token in cookie for middleware access
      document.cookie = `token=${response.access_token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`
      
      console.log('[AuthContext] Tokens stored, setting user state...')
      console.log('[AuthContext] User data:', response.user)
      
      // Set user state immediately
      setUser(response.user)
      
      // Get permissions from token with error handling
      try {
        console.log('[AuthContext] Getting user permissions...');
        const userPermissions = AuthAPI.getUserPermissions(response.access_token)
        setPermissions(userPermissions)
        console.log('[AuthContext] Permissions set:', userPermissions)
      } catch (permissionError) {
        console.warn('[AuthContext] Error getting permissions, using empty array:', permissionError)
        setPermissions([])
      }
      
      console.log('[AuthContext] Setting user state...');
      setUser(response.user)
      
      // Ensure token is in cookie before returning
      if (typeof document !== 'undefined') {
        document.cookie = `token=${response.access_token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Strict`
        console.log('[AuthContext] Token saved to cookie for middleware access')
      }
      
      console.log('[AuthContext] User state set, isAuthenticated should be true now')
      console.log('[AuthContext] Current user:', response.user)
      console.log('[AuthContext] isAuthenticated will be:', !!response.user)
      console.log('[AuthContext] Login function returning true');
      
      // Giảm delay để đảm bảo state được cập nhật nhanh hơn
      await new Promise(resolve => setTimeout(resolve, 50));
      
      return true
    } catch (error) {
      console.error("[AuthContext] Login error caught:", error)
      console.error("[AuthContext] Error details:", error instanceof Error ? error.message : error)
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
    console.log('[AuthContext] Starting logout process...')
    try {
      // Call logout API (mock or real)
      if (MockAuthService.isActive()) {
        console.log('[AuthContext] Using MOCK logout...')
        await MockAuthService.logout()
        console.log('[AuthContext] Mock logout completed')
      } else {
        await AuthAPI.logout()
        console.log('[AuthContext] Logout API completed')
      }
    } catch (error) {
      console.warn('Logout API failed, continuing with local logout:', error)
    } finally {
      // Always clear local tokens and state
      console.log('[AuthContext] Clearing local authentication data...')
      TokenService.clearTokens()
      
      // Clear all cookies that might contain authentication data
      const cookiesToClear = ['token', 'auth_token', 'auth_user', 'access_token', 'refresh_token', 'user_data']
      cookiesToClear.forEach(cookieName => {
        document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        document.cookie = `${cookieName}=; path=/; domain=.localhost; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        document.cookie = `${cookieName}=; path=/; domain=localhost; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      })
      console.log('[AuthContext] All cookies cleared')
      
      // Clear state
      setUser(null)
      setPermissions([])
      
      // Add small delay to ensure everything is cleared
      await new Promise(resolve => setTimeout(resolve, 100))
      
      console.log('[AuthContext] State cleared, logout completed')
      
      // Force page reload to ensure clean state
      if (typeof window !== 'undefined') {
        window.location.href = '/login'
      }
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
    <AuthContext.Provider value={{ ...value }}>
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
