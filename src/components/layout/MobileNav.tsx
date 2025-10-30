"use client";

import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, User } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

export function MobileNav() {
  const { profile } = useAuth();
  const pathname = usePathname();

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

  // Add admin navigation items if user has admin role
  if (profile && (profile.role === "ADMIN" || profile.role === "SUPER_ADMIN")) {
    navItems.push({
      title: "Usuarios",
      href: "/users",
      icon: Users,
      roles: ["ADMIN", "SUPER_ADMIN"],
    });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 rounded-lg px-4 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-accent-foreground"
              )}
              aria-current={isActive ? "page" : undefined}
            >
              <Icon
                className={cn("h-5 w-5", isActive && "stroke-primary")}
                aria-hidden="true"
              />
              <span className="text-[10px]">{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
