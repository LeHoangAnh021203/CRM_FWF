import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { NotificationProvider } from "@/components/notifications"
import { AuthGuard } from "@/components/AuthGuard"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <NotificationProvider>
      <AuthGuard>
        <div className="flex h-screen bg-gray-100">
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden ml-16 lg:ml-0">
            <Header />
            <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 px-4 lg:px-6 lg:pt-0">
              {children}
            </main>
          </div>
        </div>
      </AuthGuard>
    </NotificationProvider>
  )
}

