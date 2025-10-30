"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";

interface SidebarContextType {
  isOpen: boolean;
  isCollapsed: boolean;
  toggle: () => void;
  toggleCollapse: () => void;
  open: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false); // For mobile toggle
  const [isCollapsed, setIsCollapsed] = useState(false); // For desktop collapse

  const toggle = useCallback(() => {
    console.log("Sidebar toggle called, current state:", isOpen);
    setIsOpen(prev => !prev);
  }, [isOpen]);

  const toggleCollapse = useCallback(() => {
    console.log("Sidebar collapse toggle called, current state:", isCollapsed);
    setIsCollapsed(prev => !prev);
  }, [isCollapsed]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <SidebarContext.Provider value={{ isOpen, isCollapsed, toggle, toggleCollapse, open, close }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}
