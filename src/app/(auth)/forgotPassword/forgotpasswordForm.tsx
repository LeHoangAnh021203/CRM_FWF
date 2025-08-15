"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react"
import Link from "next/link"

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [email, setEmail] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate password reset email sending
    await new Promise((resolve) => setTimeout(resolve, 2000))
    setIsLoading(false)
    setIsEmailSent(true)

    // Handle password reset logic here
    console.log("Password reset request for:", email)
  }

  if (isEmailSent) {
    return (
      <div className="space-y-6">
        {/* Success State */}
        <div className="text-center space-y-2">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-2xl">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h1
            className="text-3xl font-black text-white drop-shadow-lg"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            Check Your Email
          </h1>
          <p className="text-white/90 font-medium drop-shadow-md">We&apos;ve sent a password reset link to {email}</p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20">
          <CardContent className="p-8 text-center space-y-6">
            <div className="space-y-4">
              <p className="text-white/80 text-sm leading-relaxed">
                Please check your email and click the link to reset your password. If you don&apos;t see the email, check
                your spam folder.
              </p>

              <Button
                onClick={() => setIsEmailSent(false)}
                variant="outline"
                className="w-full h-12 bg-white/10 border-white/30 text-white hover:bg-white/20 font-semibold rounded-xl transition-all duration-200"
              >
                Send Another Email
              </Button>
            </div>

            <div className="pt-6 border-t border-white/20">
              <Link
                href="/"
                className="inline-flex items-center text-sm text-blue-300 hover:text-blue-200 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Logo/Brand Section */}
      <div className="text-center space-y-2">
        <div className="w-16 h-16 bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-2xl">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg shadow-lg"></div>
        </div>
        <h1 className="text-3xl font-black text-white drop-shadow-lg" style={{ fontFamily: "var(--font-montserrat)" }}>
          Reset Password
        </h1>
        <p className="text-white/90 font-medium drop-shadow-md">Enter your email to receive a reset link</p>
      </div>

      {/* Forgot Password Card */}
      <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20">
        <CardContent className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-semibold text-white/90">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-12 bg-white/20 backdrop-blur-sm border-white/30 focus:border-orange-400 focus:ring-orange-400/30 transition-all duration-200 rounded-xl text-white placeholder:text-white/60"
                  required
                />
              </div>
              <p className="text-xs text-white/70 mt-2">We&apos;ll send you a link to reset your password</p>
            </div>

            {/* Reset Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-2xl hover:shadow-orange-500/25"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Sending Reset Link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 pt-6 border-t border-white/20 text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-sm text-blue-300 hover:text-blue-200 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>     
    </div>
  )
}
