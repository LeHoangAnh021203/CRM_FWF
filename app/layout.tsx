import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/app/contexts/AuthContext"
import { DateProvider } from "@/app/contexts/DateContext"
import { BranchProvider } from "@/app/contexts/BranchContext"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "FB Network Dashboard",
  description: "Master Report Of FB Network",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <DateProvider>
            <BranchProvider>
              {children}
            </BranchProvider>
          </DateProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
