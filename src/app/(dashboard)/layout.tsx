"use client";

import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { SidebarProvider } from "@/context/SidebarContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar - sticky on desktop, fixed on mobile */}
        <Sidebar />

        {/* Main content area - header and page content */}
        <div className="flex flex-1 flex-col min-w-0">
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
    </SidebarProvider>
  );
}
