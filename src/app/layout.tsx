import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { NotificationProvider } from "@/components/notifications"

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
        <NotificationProvider>
          <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden ml-16 lg:ml-0">
              <Header />
              <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 px-4 lg:px-6 lg:pt-0">{children}</main>
            </div>
          </div>
        </NotificationProvider>
      </body>
    </html>
  )
}
