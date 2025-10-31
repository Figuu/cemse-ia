"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  School,
  Users,
  UserCheck,
  GraduationCap,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  BarChart3,
  FileText,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { translateSchoolType, getSchoolTypeBadgeColor, translateRole, getRoleBadgeColor } from "@/lib/translations";
import { Role, SchoolType } from "@prisma/client";
import { CaseMetricsCharts } from "@/components/metrics/CaseMetricsCharts";

interface SchoolInfo {
  id: string;
  name: string;
  code: string;
  type: SchoolType;
  address: string | null;
  district: string | null;
  phone: string | null;
  email: string | null;
}

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role: Role;
  pfpUrl: string | null;
}

interface SchoolDashboardProps {
  profile: {
    id: string;
    name: string;
    email: string;
    role: Role;
    schoolId: string | null;
  };
  school: SchoolInfo;
  users: UserInfo[];
  metrics?: any;
}

export function SchoolDashboard({ profile, school, users, metrics }: SchoolDashboardProps) {
  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const directorsCount = users.filter((u) => u.role === "DIRECTOR").length;
  const profesorsCount = users.filter((u) => u.role === "PROFESOR").length;
  const isDirector = profile.role === "DIRECTOR";

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-lg border bg-gradient-to-r from-primary/10 to-primary/5 p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold">Bienvenido, {profile.name}!</h2>
            <p className="mt-1 text-muted-foreground">
              {isDirector ? "Gestiona tu colegio" : "Vista de tu colegio"}
            </p>
          </div>
          <Badge className={`${getRoleBadgeColor(profile.role)} text-lg px-4 py-2`}>
            {translateRole(profile.role)}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* School Info Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <School className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>{school.name}</CardTitle>
                  <CardDescription>
                    <code className="text-xs bg-muted px-2 py-1 rounded">
                      {school.code}
                    </code>
                  </CardDescription>
                </div>
              </div>
              <Badge className={getSchoolTypeBadgeColor(school.type)}>
                {translateSchoolType(school.type)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {school.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Dirección</p>
                  <p className="text-sm text-muted-foreground">{school.address}</p>
                  {school.district && (
                    <p className="text-xs text-muted-foreground">{school.district}</p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {school.phone && (
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Teléfono</p>
                    <p className="text-sm text-muted-foreground">{school.phone}</p>
                  </div>
                </div>
              )}

              {school.email && (
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground truncate">{school.email}</p>
                  </div>
                </div>
              )}
            </div>

            <Button asChild className="w-full mt-4">
              <Link href={`/schools/${school.id}`}>
                Ver Detalles del Colegio
                <ChevronRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle>Estadísticas</CardTitle>
            <CardDescription>Personal del colegio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total</span>
                </div>
                <span className="text-2xl font-bold">{users.length}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Directores</span>
                </div>
                <span className="text-xl font-semibold">{directorsCount}</span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Profesores</span>
                </div>
                <span className="text-xl font-semibold">{profesorsCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Case Metrics Section */}
      {metrics && (
        <div className="space-y-6">
          {/* Metrics Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Casos
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.totalCases || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Todos los reportes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Casos Abiertos
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.openCases || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Pendientes de resolución
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  En Progreso
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.inProgressCases || 0}</div>
                <p className="text-xs text-muted-foreground">
                  En seguimiento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Resueltos
                </CardTitle>
                <AlertCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics.resolvedCases || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Casos cerrados
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Metrics Charts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Gráficas de Reportes
              </CardTitle>
              <CardDescription>
                Visualización gráfica de las métricas de reportes del colegio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CaseMetricsCharts
                casesByStatus={metrics.casesByStatus}
                casesByViolenceType={metrics.casesByViolenceType}
                casesByPriority={metrics.casesByPriority}
                casesOverTime={metrics.casesOverTime}
              />
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Acceso rápido a funciones</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              asChild
              variant="outline"
              className="w-full justify-between"
            >
              <Link href={`/schools/${school.id}`}>
                <div className="flex items-center gap-2">
                  <School className="h-4 w-4" />
                  Ver mi colegio
                </div>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>

            {isDirector && (
              <Button
                asChild
                variant="outline"
                className="w-full justify-between"
              >
                <Link href="/users">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Gestionar usuarios
                  </div>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            )}

            <Button
              asChild
              variant="outline"
              className="w-full justify-between"
            >
              <Link href="/profile">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Mi perfil
                </div>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Recent Users Card */}
        <Card>
          <CardHeader>
            <CardTitle>Personal del Colegio</CardTitle>
            <CardDescription>
              Últimos {Math.min(5, users.length)} miembros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.pfpUrl || undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{user.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user.email}
                    </p>
                  </div>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {translateRole(user.role)}
                  </Badge>
                </div>
              ))}

              {users.length > 5 && (
                <Button asChild variant="ghost" className="w-full">
                  <Link href={`/schools/${school.id}`}>
                    Ver todos ({users.length})
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              )}

              {users.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No hay usuarios registrados
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
