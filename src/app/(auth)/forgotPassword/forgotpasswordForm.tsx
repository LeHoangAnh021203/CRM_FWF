"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate password reset email sending
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsLoading(false);
    setIsEmailSent(true);

    // Handle password reset logic here
    console.log("Password reset request for:", email);
  };

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
          <p className="text-white/90 font-medium drop-shadow-md">
            We&apos;ve sent a password reset link to {email}
          </p>
        </div>

        <Card className="border-0 shadow-2xl bg-white/10 backdrop-blur-xl border border-white/20">
          <CardContent className="p-8 text-center space-y-6">
            <div className="space-y-4">
              <p className="text-white/80 text-sm leading-relaxed">
                Please check your email and click the link to reset your
                password. If you don&apos;t see the email, check your spam
                folder.
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
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative">
        {/* Background with modern gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-md">
          {/* Header */}
          <div className="text-center space-y-4 mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-20 h-20 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl border border-white/30 rounded-3xl mx-auto flex items-center justify-center shadow-2xl animate-glow">
                <Image src="/logo.png" alt="Logo" width={80} height={80} />
              </div>
              <h2 className="text-4xl font-black bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Reset Password
              </h2>
            </div>
            <p className="text-gray-400 font-medium text-lg">
              Enter your email to receive a reset link
            </p>
          </div>

          {/* Form */}
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-3">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-gray-300"
                >
                  Email Address
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-orange-400 transition-colors" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 h-14 bg-white/5 backdrop-blur-sm border-white/10 focus:border-orange-400 focus:ring-orange-400/20 transition-all duration-300 rounded-2xl text-white placeholder:text-gray-400"
                    required
                  />
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  We&apos;ll send you a link to reset your password
                </p>
              </div>

              {/* Reset Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-2xl hover:shadow-orange-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="mt-8 pt-6 border-t border-white/10 text-center">
              <Link
                href="/login"
                className="inline-flex items-center text-sm text-orange-400 hover:text-orange-300 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Vouchers */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-8 relative">
        {/* Background with modern gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900 via-red-900 to-orange-900"></div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl animate-bounce"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-500/10 rounded-full blur-3xl animate-ping"></div>
        </div>

        <div className="relative z-10 text-center space-y-8">
          <div className="space-y-4">
            <h3 className="text-3xl font-black text-white drop-shadow-2xl">
              Special Offers
            </h3>
            <p className="text-white/80 font-medium text-lg">
              Get exclusive vouchers for our services
            </p>
          </div>

          <div className="flex space-y-6 items-center">
            <Image
              src="/voucher1.png"
              alt="Voucher 1"
              width={250}
              height={120}
              className=" animate-float hover:scale-105 transition-transform duration-300"
            />
            <Image
              src="/voucher2.png"
              alt="Voucher 2"
              width={300}
              height={120}
              className=" animate-float hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
