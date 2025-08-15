"use client"

import type React from "react"
import Image from "next/image"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Eye, EyeOff, User, Lock, Loader2 } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/AuthContext"

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })

  const { login } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const success = await login(formData.username, formData.password)
      
      if (success) {
        router.push("/dashboard")
      } else {
        setError("Invalid username or password")
      }
    } catch {
      setError("An error occurred during login")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (error) setError("") // Clear error when user starts typing
  }

  return (
    <div className="space-y-6">
      {/* Logo/Brand Section */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-2xl">
          <Image src="/logo.png" alt="Logo" width={60} height={60} />
        </div>
        <h1 className="text-3xl font-black text-white drop-shadow-lg" style={{ fontFamily: "var(--font-montserrat)" }}>
          Welcome Back!
        </h1>
        <p className="text-white/90 font-medium drop-shadow-md">Please enter your credentials to continue.</p>
      </div>

      {/* Login Card */}
      <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            )}

            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-semibold text-white/90">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className="pl-10 h-12 bg-white/20 backdrop-blur-sm border-white/30 focus:border-blue-400 focus:ring-blue-400/30 transition-all duration-200 rounded-xl text-white placeholder:text-white/60"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold text-white/90">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="pl-10 pr-10 h-12 bg-white/20 backdrop-blur-sm border-white/30 focus:border-blue-400 focus:ring-blue-400/30 transition-all duration-200 rounded-xl text-white placeholder:text-white/60"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot password link */}
            <div className="text-right">
              <Link
                href="/forgotPassword"
                className="text-sm text-blue-300 hover:text-blue-200 font-medium transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-2xl hover:shadow-blue-500/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Logging in...
                </>
              ) : (
                "Log In"
              )}
            </Button>
          </form>

          {/* Sign up link */}
          <div className="mt-6 pt-6 border-t border-white/20">
            <p className="text-center text-sm text-white/80">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-blue-300 hover:text-blue-200 font-medium transition-colors">
                Sign up here
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
