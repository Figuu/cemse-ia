"use client";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/context/SidebarContext";
import { ChangePasswordModal } from "@/components/ChangePasswordModal";
import { useAuth } from "@/context/AuthContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = useAuth();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar - full height */}
        <Sidebar />

        {/* Main content area - header and page content */}
        <div className="flex flex-1 flex-col">
          <Header />
          <main
            id="main-content"
            className="flex-1 overflow-auto"
            tabIndex={-1}
          >
            {children}
          </main>
        </div>
      </div>
      {profile?.forcePasswordChange && (
        <ChangePasswordModal open={true} />
      )}
    </SidebarProvider>
  );
}
