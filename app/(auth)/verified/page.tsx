"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "expired" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    const statusParam = searchParams.get("status");

    // If status is directly provided (from redirect), use it
    if (statusParam === "success") {
      setStatus("success");
      setMessage("Your account has been successfully verified!");
      return;
    }

    if (statusParam === "expired") {
      setStatus("expired");
      setMessage("Verification link has expired. Please request a new one.");
      return;
    }

    // Otherwise, verify the token
    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link. No token provided.");
      return;
    }

    verifyToken(token);
  }, [searchParams]);

  const verifyToken = async (token: string) => {
    try {
      const response = await fetch(`/api/proxy/auth/verify?token=${encodeURIComponent(token)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setMessage(data.message || "Your account has been successfully verified!");
        // Redirect to success after 2 seconds
        setTimeout(() => {
          router.push("/verified?status=success");
        }, 2000);
      } else {
        // Check if token expired
        if (response.status === 410 || data.error?.toLowerCase().includes("expired")) {
          setStatus("expired");
          setMessage(data.message || "Verification link has expired. Please request a new one.");
          setTimeout(() => {
            router.push("/verified?status=expired");
          }, 2000);
        } else {
          setStatus("error");
          setMessage(data.message || data.error || "Verification failed. Please try again.");
        }
      }
    } catch (error) {
      console.error("Verification error:", error);
      setStatus("error");
      setMessage("An error occurred during verification. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl p-8 shadow-2xl text-center">
          {status === "loading" && (
            <>
              <div className="mb-6">
                <Loader2 className="w-16 h-16 text-blue-400 animate-spin mx-auto" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Verifying your account...</h1>
              <p className="text-gray-300">Please wait while we verify your email address.</p>
            </>
          )}

          {status === "success" && (
            <>
              <div className="mb-6">
                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-12 h-12 text-green-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Account Verified!</h1>
              <p className="text-gray-300 mb-6">{message}</p>
              <Link
                href="/login"
                className="inline-block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105"
              >
                Go to Login
              </Link>
            </>
          )}

          {status === "expired" && (
            <>
              <div className="mb-6">
                <div className="w-20 h-20 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="w-12 h-12 text-orange-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Link Expired</h1>
              <p className="text-gray-300 mb-6">{message}</p>
              <div className="space-y-3">
                <Link
                  href="/signup"
                  className="block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                >
                  Sign Up Again
                </Link>
                <Link
                  href="/login"
                  className="block px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-300"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}

          {status === "error" && (
            <>
              <div className="mb-6">
                <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto">
                  <XCircle className="w-12 h-12 text-red-400" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-4">Verification Failed</h1>
              <p className="text-gray-300 mb-6">{message}</p>
              <div className="space-y-3">
                <Link
                  href="/signup"
                  className="block px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                >
                  Try Again
                </Link>
                <Link
                  href="/login"
                  className="block px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all duration-300"
                >
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
        </div>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}

