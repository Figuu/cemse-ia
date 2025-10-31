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
import { Users, UserPlus, Crown, Shield, User } from "lucide-react";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  role: string;
  forcePasswordChange: boolean;
}

interface SuperAdminStats {
  totalUsers: number;
  superAdmins: number;
  admins: number;
  regularUsers: number;
  newUsersThisMonth: number;
  newUsersThisWeek: number;
  recentRegistrations: User[];
}

export function SuperAdminDashboard() {
  const [stats, setStats] = useState<SuperAdminStats>({
    totalUsers: 0,
    superAdmins: 0,
    admins: 0,
    regularUsers: 0,
    newUsersThisMonth: 0,
    newUsersThisWeek: 0,
    recentRegistrations: [],
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

        if (allUsers.length > 0) {
          const now = new Date();
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

          const stats: SuperAdminStats = {
            totalUsers: allUsers.length,
            superAdmins: allUsers.filter((u: User) => u.role === "SUPER_ADMIN")
              .length,
            admins: allUsers.filter((u: User) => u.role === "ADMIN").length,
            regularUsers: allUsers.filter((u: User) => u.role === "USER").length,
            newUsersThisMonth: allUsers.filter(
              (u: User) => new Date(u.createdAt) >= monthAgo
            ).length,
            newUsersThisWeek: allUsers.filter(
              (u: User) => new Date(u.createdAt) >= weekAgo
            ).length,
            recentRegistrations: allUsers
              .sort(
                (a: User, b: User) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .slice(0, 5),
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
            <h2 className="text-2xl font-bold">
              Panel de Super Administración
            </h2>
            <p className="mt-1 text-muted-foreground">
              Visión completa del sistema y gestión total de usuarios
            </p>
          </div>
          <Crown className="h-12 w-12 text-primary" />
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
            <p className="text-xs text-muted-foreground">En todo el sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Super Administradores
            </CardTitle>
            <Crown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.superAdmins}</div>
            <p className="text-xs text-muted-foreground">Con acceso total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Administradores
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.admins}</div>
            <p className="text-xs text-muted-foreground">
              Con permisos elevados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Usuarios Regulares
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.regularUsers}</div>
            <p className="text-xs text-muted-foreground">Rol estándar</p>
          </CardContent>
        </Card>
      </div>

      {/* Growth Statistics */}
      <div className="grid gap-6 md:grid-cols-3">
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
              Registrados en los últimos 30 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Nuevos esta semana
            </CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newUsersThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              Registrados en los últimos 7 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tasa de crecimiento
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalUsers > 0
                ? ((stats.newUsersThisMonth / stats.totalUsers) * 100).toFixed(
                    1
                  )
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">Incremento mensual</p>
          </CardContent>
        </Card>
      </div>

      {/* User Distribution by Role */}
      <Card>
        <CardHeader>
          <CardTitle>Distribución de Usuarios por Rol</CardTitle>
          <CardDescription>
            Desglose completo de usuarios según su rol en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border bg-muted p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Super Admin</span>
                </div>
                <Badge variant="destructive">{stats.superAdmins}</Badge>
              </div>
              {stats.totalUsers > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Porcentaje</span>
                    <span>
                      {((stats.superAdmins / stats.totalUsers) * 100).toFixed(
                        1
                      )}
                      %
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border bg-muted p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Admin</span>
                </div>
                <Badge variant="default">{stats.admins}</Badge>
              </div>
              {stats.totalUsers > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Porcentaje</span>
                    <span>
                      {((stats.admins / stats.totalUsers) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border bg-muted p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Usuario</span>
                </div>
                <Badge variant="secondary">{stats.regularUsers}</Badge>
              </div>
              {stats.totalUsers > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Porcentaje</span>
                    <span>
                      {((stats.regularUsers / stats.totalUsers) * 100).toFixed(
                        1
                      )}
                      %
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Registrations */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Registros Recientes</CardTitle>
            <CardDescription>
              Últimos 5 usuarios registrados en el sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {stats.recentRegistrations.length > 0 ? (
              <>
                <div className="space-y-3">
                  {stats.recentRegistrations.map((user, index) => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                          <span className="text-xs font-semibold text-primary">
                            #{index + 1}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {user.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Registrado:{" "}
                            {new Date(user.createdAt).toLocaleDateString(
                              "es-ES",
                              {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant={
                          user.role === "SUPER_ADMIN"
                            ? "destructive"
                            : user.role === "ADMIN"
                              ? "default"
                              : "secondary"
                        }
                      >
                        {user.role}
                      </Badge>
                    </div>
                  ))}
                </div>
                <Button asChild variant="outline" className="mt-4 w-full">
                  <Link href="/users">Ver todos los usuarios</Link>
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Users className="mb-3 h-12 w-12 text-muted-foreground" />
                <p className="mb-1 font-medium">No hay usuarios registrados</p>
                <p className="mb-4 text-sm text-muted-foreground">
                  Comienza creando el primer usuario en el sistema
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
            <CardTitle>Acciones del Super Admin</CardTitle>
            <CardDescription>
              Funciones exclusivas para super administradores
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full justify-start">
              <Link href="/users/create">
                <UserPlus className="mr-2 h-4 w-4" />
                Crear nuevo usuario
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full justify-start">
              <Link href="/users">
                <Users className="mr-2 h-4 w-4" />
                Gestionar todos los usuarios
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
