"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Role, SchoolType } from "@prisma/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SchoolModal } from "@/components/schools/SchoolModal";
import { UserModal } from "@/components/users/UserModal";
import {
  translateSchoolType,
  getSchoolTypeBadgeColor,
  translateRole,
  getRoleBadgeColor,
  translateViolenceType,
  translateCaseStatus,
  translateCasePriority,
} from "@/lib/translations";
import { CaseMetricsCharts } from "@/components/metrics/CaseMetricsCharts";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Pencil,
  Plus,
  Loader2,
  Mail,
  Phone,
  MapPin,
  Building2,
  Edit,
  Trash2,
  FileText,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface School {
  id: string;
  name: string;
  code: string;
  type: SchoolType;
  address: string | null;
  district: string | null;
  phone: string | null;
  email: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  users: User[];
  _count: {
    users: number;
  };
}

// Type alias compatible with UserModal's UserData interface
type UserData = {
  id: string;
  email: string;
  name: string;
  phone?: string;
  department?: string;
  role: Role;
  schoolId?: string | null;
  forcePasswordChange?: boolean;
};

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  pfpUrl: string | null;
  phone: string | null;
  department?: string;
  schoolId?: string | null;
  forcePasswordChange?: boolean;
}

export default function SchoolDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { profile } = useAuth();
  const router = useRouter();
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  const canManage =
    profile?.role === "ADMIN" ||
    profile?.role === "SUPER_ADMIN" ||
    (profile?.role === "DIRECTOR" && profile?.schoolId === resolvedParams.id);

  const canEdit = profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN";

  const fetchSchool = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/schools/${resolvedParams.id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar el colegio");
      }

      setSchool(data);
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Error al cargar el colegio",
        variant: "destructive",
      });
      router.push("/schools");
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async () => {
    try {
      setLoadingMetrics(true);
      const response = await fetch(`/api/schools/${resolvedParams.id}/metrics`);
      const data = await response.json();

      if (response.ok) {
        setMetrics(data);
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    fetchSchool();
    fetchMetrics();
  }, [resolvedParams.id]);

  const handleCreateUser = () => {
    setEditingUser(null);
    setUserModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    // Convert User to UserData format for the modal
    const userData: UserData = {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone || undefined,
      department: user.department,
      role: user.role,
      schoolId: user.schoolId,
      forcePasswordChange: user.forcePasswordChange,
    };
    setEditingUser(userData);
    setUserModalOpen(true);
  };

  const handleDeleteUser = (user: User) => {
    setDeletingUser(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingUser) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/users/${deletingUser.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Usuario eliminado exitosamente",
        });
        fetchSchool();
      } else {
        toast({
          title: data.error || "Error al eliminar el usuario",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error al eliminar el usuario",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setDeletingUser(null);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!school) {
    return null;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push("/schools")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-bold tracking-tight">{school.name}</h2>
            <Badge className={getSchoolTypeBadgeColor(school.type)}>
              {translateSchoolType(school.type)}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Código: <code className="text-sm bg-muted px-2 py-1 rounded">{school.code}</code>
          </p>
        </div>
        {canEdit && (
          <Button onClick={() => setEditModalOpen(true)} className="gap-2">
            <Pencil className="h-4 w-4" />
            <span className="hidden sm:inline">Editar Colegio</span>
          </Button>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información del Colegio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {school.address && (
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Dirección</p>
                  <p className="text-sm text-muted-foreground">{school.address}</p>
                </div>
              </div>
            )}

            {school.district && (
              <div className="flex items-start gap-3">
                <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Distrito</p>
                  <p className="text-sm text-muted-foreground">{school.district}</p>
                </div>
              </div>
            )}

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
                  <p className="text-sm font-medium">Correo Electrónico</p>
                  <p className="text-sm text-muted-foreground">{school.email}</p>
                </div>
              </div>
            )}

            {!school.address && !school.district && !school.phone && !school.email && (
              <p className="text-sm text-muted-foreground">
                No hay información de contacto disponible
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estadísticas de Usuarios</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-2xl font-bold">{school._count.users}</p>
              <p className="text-sm text-muted-foreground">Usuarios totales</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {school.users.filter((u) => u.role === "DIRECTOR").length}
              </p>
              <p className="text-sm text-muted-foreground">Directores</p>
            </div>
            <div>
              <p className="text-2xl font-bold">
                {school.users.filter((u) => u.role === "PROFESOR").length}
              </p>
              <p className="text-sm text-muted-foreground">Profesores</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Case Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Métricas de Reportes
          </CardTitle>
          <CardDescription>
            Estadísticas de casos reportados en este colegio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingMetrics ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : metrics ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Total
                  </div>
                  <p className="text-2xl font-bold">{metrics.totalCases}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    Abiertos
                  </div>
                  <p className="text-2xl font-bold text-red-600">{metrics.openCases}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 text-yellow-500" />
                    En Progreso
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">{metrics.inProgressCases}</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    Resueltos
                  </div>
                  <p className="text-2xl font-bold text-green-600">{metrics.resolvedCases}</p>
                </div>
              </div>

              {/* By Status */}
              {metrics.casesByStatus && metrics.casesByStatus.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Por Estado</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {metrics.casesByStatus.map((item: any) => (
                      <div key={item.status} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm">{translateCaseStatus(item.status)}</span>
                        <span className="text-sm font-bold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* By Violence Type */}
              {metrics.casesByViolenceType && metrics.casesByViolenceType.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Por Tipo de Violencia</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {metrics.casesByViolenceType.map((item: any) => (
                      <div key={item.type} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm">{translateViolenceType(item.type)}</span>
                        <span className="text-sm font-bold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* By Priority */}
              {metrics.casesByPriority && metrics.casesByPriority.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3">Por Prioridad</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {metrics.casesByPriority.map((item: any) => (
                      <div key={item.priority} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="text-sm">{translateCasePriority(item.priority)}</span>
                        <span className="text-sm font-bold">{item.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Cases */}
              {metrics.recentCases !== undefined && (
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    <span className="text-muted-foreground">Reportes en los últimos 30 días:</span>
                    <span className="font-bold">{metrics.recentCases}</span>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center p-4">
              No se pudieron cargar las métricas
            </p>
          )}
        </CardContent>
      </Card>

      {/* Charts Section */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Gráficas de Reportes
            </CardTitle>
            <CardDescription>
              Visualización gráfica de las métricas de reportes
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
      )}

      {!loadingMetrics && !metrics && (
        <Card>
          <CardContent className="p-8">
            <p className="text-sm text-muted-foreground text-center">
              No se pudieron cargar las métricas
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Usuarios del Colegio</CardTitle>
              <CardDescription>
                Gestiona los usuarios asignados a este colegio
              </CardDescription>
            </div>
            {canManage && (
              <Button onClick={handleCreateUser} className="gap-2">
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Agregar Usuario</span>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {school.users.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No hay usuarios asignados a este colegio
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Rol</TableHead>
                    <TableHead>Estado</TableHead>
                    {canManage && <TableHead className="text-right">Acciones</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {school.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.pfpUrl || undefined} />
                            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            {user.department && (
                              <p className="text-sm text-muted-foreground">
                                {user.department}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge className={getRoleBadgeColor(user.role)}>
                          {translateRole(user.role)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.forcePasswordChange ? (
                          <Badge variant="destructive">Cambio requerido</Badge>
                        ) : (
                          <Badge variant="secondary">Activo</Badge>
                        )}
                      </TableCell>
                      {canManage && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditUser(user)}
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteUser(user)}
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <SchoolModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        school={school}
        onSuccess={fetchSchool}
      />

      <UserModal
        open={userModalOpen}
        onOpenChange={setUserModalOpen}
        user={editingUser}
        preselectedSchoolId={resolvedParams.id}
        onSuccess={fetchSchool}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente al usuario{" "}
              <strong>{deletingUser?.name}</strong> del colegio. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
