import type React from "react";
import { Sidebar } from "@/app/components/sidebar";
import { Header } from "@/app/components/header";
import { NotificationProvider } from "@/app/components/notifications";
import { AuthGuard } from "@/app/components/AuthGuard";
import { TokenRefreshWrapper } from "@/app/components/TokenRefreshWrapper";
import { NavigationDebugger } from "@/app/components/NavigationDebugger";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
  return (
    <div className='flex h-screen bg-gray-100'>
      <Sidebar />
      <div className='flex-1 flex flex-col overflow-hidden ml-16 lg:ml-0'>
        <Header />
        <main className='flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 px-4 lg:px-6 lg:pt-0'>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NotificationProvider>
      <AuthGuard>
        <TokenRefreshWrapper>
          <DashboardLayoutContent>{children}</DashboardLayoutContent>
          <NavigationDebugger />
        </TokenRefreshWrapper>
      </AuthGuard>
    </NotificationProvider>
  );
}
