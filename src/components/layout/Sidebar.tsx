"use client";

import { useAuth } from "@/context/AuthContext";
import { useSidebar } from "@/context/SidebarContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, User, X, School, FileText, History } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useEffect, useRef } from "react";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

export function Sidebar() {
  const { profile } = useAuth();
  const { isOpen, isCollapsed, close } = useSidebar();
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  // Close sidebar on route change (mobile) - but not on initial mount
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // Debug log
  useEffect(() => {
    console.log("Sidebar isOpen state:", isOpen);
  }, [isOpen]);

  const navItems: NavItem[] = [
    {
      title: "Inicio",
      href: "/dashboard",
      icon: Home,
    },
    {
      title: "Mi Perfil",
      href: "/profile",
      icon: User,
    },
  ];

  // Add school management navigation for ADMIN and SUPER_ADMIN only
  if (profile && (profile.role === "ADMIN" || profile.role === "SUPER_ADMIN")) {
    navItems.push({
      title: "Colegios",
      href: "/schools",
      icon: School,
      roles: ["ADMIN", "SUPER_ADMIN"],
    });
  }

  // Add user management navigation for ADMIN, SUPER_ADMIN, and DIRECTOR
  if (profile && (profile.role === "ADMIN" || profile.role === "SUPER_ADMIN" || profile.role === "DIRECTOR")) {
    navItems.push({
      title: "Usuarios",
      href: "/users",
      icon: Users,
      roles: ["ADMIN", "SUPER_ADMIN", "DIRECTOR"],
    });
  }

  // Add school info navigation for DIRECTOR and PROFESOR (their own school)
  if (profile && profile.schoolId && (profile.role === "DIRECTOR" || profile.role === "PROFESOR")) {
    navItems.push({
      title: "Mi Colegio",
      href: `/schools/${profile.schoolId}`,
      icon: School,
      roles: ["DIRECTOR", "PROFESOR"],
    });
  }

  // Add cases navigation for DIRECTOR, PROFESOR, ADMIN, and SUPER_ADMIN
  if (profile && ["DIRECTOR", "PROFESOR", "ADMIN", "SUPER_ADMIN"].includes(profile.role)) {
    navItems.push({
      title: "Reportes",
      href: "/cases",
      icon: FileText,
      roles: ["DIRECTOR", "PROFESOR", "ADMIN", "SUPER_ADMIN"],
    });
  }

  // Add audit logs navigation for ADMIN and SUPER_ADMIN only
  if (profile && (profile.role === "ADMIN" || profile.role === "SUPER_ADMIN")) {
    navItems.push({
      title: "Auditoría",
      href: "/audit-logs",
      icon: History,
      roles: ["ADMIN", "SUPER_ADMIN"],
    });
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "shrink-0 border-r bg-background transition-all duration-300",
          // Mobile: fixed overlay
          "fixed inset-y-0 left-0 z-50 w-64",
          "md:relative md:z-auto",
          // Mobile: slide in/out
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          // Desktop: expand/collapse width
          isCollapsed ? "md:w-16" : "md:w-64"
        )}
      >
        {/* Branding header - visible on desktop, replaced with close button on mobile */}
        <div className="flex h-16 items-center justify-between px-4">
          <div className={cn(
            "hidden md:flex items-center gap-2 transition-opacity duration-300",
            isCollapsed ? "opacity-0 w-0" : "opacity-100"
          )}>
            <h1 className="text-xl font-bold whitespace-nowrap">CEMSE-IA</h1>
          </div>

          {/* Mobile close button */}
          <div className="flex md:hidden items-center justify-between w-full">
            <h2 className="text-lg font-semibold">Menu</h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={close}
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <nav className="space-y-1 p-4">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  isCollapsed && "md:justify-center"
                )}
                aria-current={isActive ? "page" : undefined}
                title={isCollapsed ? item.title : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className={cn(
                  "transition-opacity duration-300",
                  isCollapsed ? "md:hidden" : "block"
                )}>
                  {item.title}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
