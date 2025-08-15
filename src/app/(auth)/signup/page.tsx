import { SignUpForm } from "./signupForm"

export default function SignUpPage() {
  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 z-0">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 animate-pulse"></div>

        {/* Floating geometric shapes */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-bounce"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-cyan-500/25 to-blue-500/25 rounded-full blur-3xl animate-ping"></div>
        </div>

        {/* Moving particles effect */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-white/60 rounded-full animate-ping"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-blue-300/80 rounded-full animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-3 h-3 bg-purple-300/60 rounded-full animate-bounce"></div>
          <div className="absolute bottom-10 right-10 w-1 h-1 bg-cyan-300/80 rounded-full animate-ping"></div>
          <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-pink-300/60 rounded-full animate-pulse"></div>
          <div className="absolute top-2/3 right-1/3 w-1 h-1 bg-indigo-300/80 rounded-full animate-bounce"></div>
        </div>

        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <SignUpForm />
      </div>
    </div>
  )
}
