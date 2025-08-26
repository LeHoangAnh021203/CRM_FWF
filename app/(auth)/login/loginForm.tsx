"use client";

import type React from "react";
import Image from "next/image";
import { useState } from "react";
import { Eye, EyeOff, User, Lock, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import { Label } from "@/app/components/ui/label";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("[LoginForm] Attempting login...");
      const success = await login(formData.username, formData.password);
      console.log("[LoginForm] Login result:", success);

      if (success) {
        console.log(
          "[LoginForm] Login successful, redirecting to dashboard..."
        );
        // Chuyển hướng ngay lập tức sau khi đăng nhập thành công
        router.push("/dashboard");
      } else {
        console.log("[LoginForm] Login failed, showing error");
        setError("Invalid username or password");
      }
    } catch (error) {
      console.error("[LoginForm] Login error:", error);
      setError("An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (error) setError(""); // Clear error when user starts typing
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden min-h-screen">
        <div className="relative w-full h-full">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover transform scale-110 animate-slow-pan video-smooth"
            style={{
              filter: "brightness(1) contrast(1.1) saturate(1.2)",
              willChange: "transform",
              backfaceVisibility: "hidden",
              transform: "translateZ(0)",
            }}
            onLoadedData={(e) => {
              const video = e.target as HTMLVideoElement;
              // Bắt đầu từ 1/4 video để tránh phần đầu có thể không mượt
              video.currentTime = video.duration / 4;
            }}
            onTimeUpdate={(e) => {
              const video = e.target as HTMLVideoElement;
              // Khi video gần đến cuối (90%), quay lại 1/4 để tránh phần cuối bị mất
              if (video.currentTime >= video.duration * 0.9) {
                video.currentTime = video.duration / 4;
              }
            }}
            onCanPlay={(e) => {
              const video = e.target as HTMLVideoElement;
              // Đảm bảo video chạy mượt mà
              video.playbackRate = 1.0;
            }}
          >
            <source src="/fox.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Enhanced gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-black/5 to-purple-500/20"></div>

          {/* Modern geometric shapes */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-bounce"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl animate-ping"></div>
          </div>

          {/* Floating particles */}
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-2 h-2 bg-white/30 rounded-full animate-ping"></div>
            <div className="absolute top-40 right-32 w-1 h-1 bg-blue-300/50 rounded-full animate-pulse"></div>
            <div className="absolute bottom-32 left-40 w-3 h-3 bg-purple-300/40 rounded-full animate-bounce"></div>
            <div className="absolute bottom-20 right-20 w-1 h-1 bg-cyan-300/50 rounded-full animate-ping"></div>
          </div>
        </div>

        {/* Enhanced branding overlay */}
        <div className="absolute inset-0 flex items-center justify-center z-10"></div>
      </div>

      {/* Login Form Section - Modern Design */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 relative min-h-screen">
        {/* Background with modern gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"></div>

        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 w-full max-w-lg">
          {/* Modern header */}
          <div className="text-center space-y-6 ">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-xl border border-white/30 rounded-3xl mx-auto flex items-center justify-center shadow-2xl animate-glow">
                <Image src="/logo.png" alt="Logo" width={96} height={96} />
              </div>
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-xl animate-pulse"></div>
            </div>
            <div className="space-y-2">
              <h1
                className="text-5xl font-black text-white drop-shadow-2xl animate-float"
                style={{ fontFamily: "var(--font-montserrat)" }}
              >
                FB Network
              </h1>
              <p className="text-white/90 font-medium drop-shadow-lg text-xl">
                Welcome to the Face Wash Fox
              </p>
            </div>
          </div>

          {/* Modern login form */}
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-10 shadow-2xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl backdrop-blur-sm">
                  <p className="text-red-300 text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Username Field */}
              <div className="space-y-3">
                <Label
                  htmlFor="username"
                  className="text-sm font-semibold text-gray-300"
                >
                  Username
                </Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={(e) =>
                      handleInputChange("username", e.target.value)
                    }
                    className="pl-12 h-14 bg-white/5 backdrop-blur-sm border-white/10 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-300 rounded-2xl text-white placeholder:text-gray-400"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <Label
                  htmlFor="password"
                  className="text-sm font-semibold text-gray-300"
                >
                  Password
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-blue-400 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    className="pl-12 pr-12 h-14 bg-white/5 backdrop-blur-sm border-white/10 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-300 rounded-2xl text-white placeholder:text-gray-400"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot password link */}
              <div className="text-right">
                <Link
                  href="/forgotPassword"
                  className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Forgot your password?
                </Link>
              </div>

              {/* Modern login button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-2xl hover:shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Modern sign up link */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-center text-sm text-gray-400">
                Don&apos;t have an account?{" "}
                <Link
                  href="/signup"
                  className="text-blue-400 hover:text-blue-300 font-semibold transition-colors"
                >
                  Create account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
