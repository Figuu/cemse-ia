"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DashboardSkeleton } from "@/components/loading/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, Activity, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  role: string;
  forcePasswordChange: boolean;
}

interface DashboardStats {
  totalUsers: number;
  newUsersThisMonth: number;
  newUsersThisWeek: number;
  activeUsers: number;
  admins: number;
  regularUsers: number;
}

export function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    newUsersThisMonth: 0,
    newUsersThisWeek: 0,
    activeUsers: 0,
    admins: 0,
    regularUsers: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all users with pagination
        let allUsers: User[] = [];
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const response = await fetch(`/api/users?limit=100&page=${page}`);
          const data = await response.json();

          if (response.ok && data.users && data.users.length > 0) {
            allUsers = [...allUsers, ...data.users];
            hasMore = page < (data.pagination?.totalPages || 1);
            page++;
          } else {
            hasMore = false;
          }
        }

        if (allUsers.length > 0 || page === 1) {
          const now = new Date();
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

          const stats: DashboardStats = {
            totalUsers: allUsers.length,
            newUsersThisMonth: allUsers.filter(
              (u: User) => new Date(u.createdAt) >= monthAgo
            ).length,
            newUsersThisWeek: allUsers.filter(
              (u: User) => new Date(u.createdAt) >= weekAgo
            ).length,
            activeUsers: allUsers.filter((u: User) => !u.forcePasswordChange)
              .length,
            admins: allUsers.filter(
              (u: User) => u.role === "ADMIN" || u.role === "SUPER_ADMIN"
            ).length,
            regularUsers: allUsers.filter((u: User) => u.role === "USER").length,
          };

          setStats(stats);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-lg border bg-gradient-to-r from-primary/10 to-primary/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Panel de Administración</h2>
            <p className="mt-1 text-muted-foreground">
              Estadísticas y gestión de usuarios de la organización
            </p>
          </div>
          <ShieldCheck className="h-12 w-12 text-primary" />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total de Usuarios
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} activos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nuevos este mes
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newUsersThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              {stats.newUsersThisWeek} esta semana
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuarios Regulares
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.regularUsers}</div>
            <p className="text-xs text-muted-foreground">Rol estándar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Administradores
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
            <p className="text-xs text-muted-foreground">
              Con permisos elevados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Usuarios</CardTitle>
            <CardDescription>
              Administra los usuarios del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.totalUsers > 0 ? (
              <>
                <Button asChild className="w-full justify-start">
                  <Link href="/users">
                    <Users className="mr-2 h-4 w-4" />
                    Ver todos los usuarios
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  className="w-full justify-start"
                >
                  <Link href="/users/create">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear nuevo usuario
                  </Link>
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <UserPlus className="mb-3 h-12 w-12 text-muted-foreground" />
                <p className="mb-1 font-medium">
                  No hay usuarios en el sistema
                </p>
                <p className="mb-4 text-sm text-muted-foreground">
                  Comienza agregando el primer usuario
                </p>
                <Button asChild>
                  <Link href="/users/create">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear primer usuario
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Resumen de actividad del sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span>Usuarios activos</span>
                </div>
                <Badge variant="secondary">{stats.activeUsers}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                  <span>Nuevos este mes</span>
                </div>
                <Badge variant="secondary">{stats.newUsersThisMonth}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Total en el sistema</span>
                </div>
                <Badge variant="default">{stats.totalUsers}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
