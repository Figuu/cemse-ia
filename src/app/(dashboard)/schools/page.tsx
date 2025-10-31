"use client";

import { useState, useEffect, useCallback } from "react";
import { School, ViolenceType, CaseStatus, CasePriority } from "@prisma/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SchoolModal } from "@/components/schools/SchoolModal";
import {
  translateSchoolType,
  getSchoolTypeBadgeColor,
  translateViolenceType,
  translateCaseStatus,
  translateCasePriority,
} from "@/lib/translations";
import { CaseMetricsCharts } from "@/components/metrics/CaseMetricsCharts";
import { toast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Users,
  Loader2,
  FileText,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Clock,
  BarChart3,
} from "lucide-react";
import Link from "next/link";
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

interface SchoolWithCount extends School {
  code: string;
  district: string | null;
  _count: {
    users: number;
  };
}

export default function SchoolsPage() {
  const { profile } = useAuth();
  const [schools, setSchools] = useState<SchoolWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSchool, setDeletingSchool] = useState<SchoolWithCount | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [metrics, setMetrics] = useState<{
    totalCases?: number;
    openCases?: number;
    inProgressCases?: number;
    resolvedCases?: number;
    recentCases?: number;
    casesByStatus?: Array<{ status: string; count: number }>;
    casesByViolenceType?: Array<{ type: string; count: number }>;
    casesByPriority?: Array<{ priority: string; count: number }>;
    casesBySchool?: Array<{ schoolId: string; schoolName: string; count: number }>;
    casesOverTime?: Array<{ date: string; count: number }>;
  } | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);
  const [metricsFilters, setMetricsFilters] = useState({
    schoolId: "all",
    violenceType: "all",
    status: "all",
    priority: "all",
    startDate: "",
    endDate: "",
  });
  const [allSchools, setAllSchools] = useState<SchoolWithCount[]>([]);

  const canManage = profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN";

  const fetchSchools = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (typeFilter && typeFilter !== "all") params.append("type", typeFilter);
      params.append("limit", "100");

      const response = await fetch(`/api/schools?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar los colegios");
      }

      setSchools(data.data || []);
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Error al cargar los colegios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter]);

  const fetchMetrics = useCallback(async () => {
    if (!canManage) return; // Only admins can see metrics

    try {
      setLoadingMetrics(true);
      const params = new URLSearchParams();
      if (metricsFilters.schoolId && metricsFilters.schoolId !== "all") {
        params.append("schoolId", metricsFilters.schoolId);
      }
      if (metricsFilters.violenceType && metricsFilters.violenceType !== "all") {
        params.append("violenceType", metricsFilters.violenceType);
      }
      if (metricsFilters.status && metricsFilters.status !== "all") {
        params.append("status", metricsFilters.status);
      }
      if (metricsFilters.priority && metricsFilters.priority !== "all") {
        params.append("priority", metricsFilters.priority);
      }
      if (metricsFilters.startDate) params.append("startDate", metricsFilters.startDate);
      if (metricsFilters.endDate) params.append("endDate", metricsFilters.endDate);

      const response = await fetch(`/api/cases/metrics?${params}`);
      const data = await response.json();

      if (response.ok) {
        setMetrics(data);
      }
    } catch (error) {
      console.error("Error fetching metrics:", error);
    } finally {
      setLoadingMetrics(false);
    }
  }, [canManage, metricsFilters]);

  const fetchAllSchools = useCallback(async () => {
    if (!canManage) return;
    try {
      const response = await fetch("/api/schools/list");
      const data = await response.json();
      if (response.ok) {
        // The API returns an array directly, not an object with schools property
        setAllSchools(Array.isArray(data) ? data : data.schools || []);
      }
    } catch (error) {
      console.error("Error fetching all schools:", error);
    }
  }, [canManage]);

  useEffect(() => {
    fetchSchools();
    if (canManage) {
      fetchAllSchools();
      fetchMetrics();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchSchools, canManage]);

  useEffect(() => {
    if (canManage) {
      fetchMetrics();
    }
  }, [fetchMetrics, canManage]);

  const handleEdit = (school: School) => {
    setEditingSchool(school);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingSchool(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingSchool(null);
  };

  const handleDelete = (school: SchoolWithCount) => {
    setDeletingSchool(school);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingSchool) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/schools/${deletingSchool.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar el colegio");
      }

      toast({
        title: "Colegio eliminado exitosamente",
      });
      fetchSchools();
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Error al eliminar el colegio",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setDeletingSchool(null);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Colegios</h2>
          <p className="text-muted-foreground">
            Gestiona los colegios del sistema
          </p>
        </div>
        {canManage && (
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Colegio</span>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Busca y filtra colegios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, código o distrito..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Tipo de colegio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="PUBLIC">Público</SelectItem>
                <SelectItem value="PRIVATE">Privado</SelectItem>
                <SelectItem value="SUBSIDIZED">Convenio</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Section - Only for Admins */}
      {canManage && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Métricas Generales de Reportes
            </CardTitle>
            <CardDescription>
              Estadísticas de todos los reportes del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
              <div className="space-y-2">
                <label className="text-sm font-medium">Colegio</label>
                <Select
                  value={metricsFilters.schoolId || "all"}
                  onValueChange={(value) =>
                    setMetricsFilters({ ...metricsFilters, schoolId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los colegios" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los colegios</SelectItem>
                    {allSchools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tipo de Violencia</label>
                <Select
                  value={metricsFilters.violenceType || "all"}
                  onValueChange={(value) =>
                    setMetricsFilters({ ...metricsFilters, violenceType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    <SelectItem value="PHYSICAL">Física</SelectItem>
                    <SelectItem value="VERBAL">Verbal</SelectItem>
                    <SelectItem value="PSYCHOLOGICAL">Psicológica</SelectItem>
                    <SelectItem value="SEXUAL">Sexual</SelectItem>
                    <SelectItem value="CYBERBULLYING">Ciberacoso</SelectItem>
                    <SelectItem value="DISCRIMINATION">Discriminación</SelectItem>
                    <SelectItem value="PROPERTY_DAMAGE">Daño a Propiedad</SelectItem>
                    <SelectItem value="OTHER">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <Select
                  value={metricsFilters.status || "all"}
                  onValueChange={(value) =>
                    setMetricsFilters({ ...metricsFilters, status: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todos los estados" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los estados</SelectItem>
                    <SelectItem value="OPEN">Abierto</SelectItem>
                    <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                    <SelectItem value="UNDER_REVIEW">En Revisión</SelectItem>
                    <SelectItem value="RESOLVED">Resuelto</SelectItem>
                    <SelectItem value="CLOSED">Cerrado</SelectItem>
                    <SelectItem value="ARCHIVED">Archivado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Prioridad</label>
                <Select
                  value={metricsFilters.priority || "all"}
                  onValueChange={(value) =>
                    setMetricsFilters({ ...metricsFilters, priority: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Todas las prioridades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas las prioridades</SelectItem>
                    <SelectItem value="LOW">Baja</SelectItem>
                    <SelectItem value="MEDIUM">Media</SelectItem>
                    <SelectItem value="HIGH">Alta</SelectItem>
                    <SelectItem value="URGENT">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha Inicio</label>
                <Input
                  type="date"
                  value={metricsFilters.startDate}
                  onChange={(e) =>
                    setMetricsFilters({ ...metricsFilters, startDate: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha Fin</label>
                <Input
                  type="date"
                  value={metricsFilters.endDate}
                  onChange={(e) =>
                    setMetricsFilters({ ...metricsFilters, endDate: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Metrics Display */}
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

                {/* By School */}
                {metrics.casesBySchool && metrics.casesBySchool.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Por Colegio</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {metrics.casesBySchool.slice(0, 10).map((item: { schoolId: string; schoolName: string; count: number }) => (
                        <div
                          key={item.schoolId}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <div>
                            <span className="text-sm font-medium">{item.schoolName}</span>
                          </div>
                          <span className="text-sm font-bold">{item.count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* By Status */}
                {metrics.casesByStatus && metrics.casesByStatus.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-3">Por Estado</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {metrics.casesByStatus.map((item: { status: string; count: number }) => (
                        <div
                          key={item.status}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <span className="text-sm">{translateCaseStatus(item.status as CaseStatus)}</span>
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
                      {metrics.casesByViolenceType.map((item: { type: string; count: number }) => (
                        <div
                          key={item.type}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <span className="text-sm">{translateViolenceType(item.type as ViolenceType)}</span>
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
                      {metrics.casesByPriority.map((item: { priority: string; count: number }) => (
                        <div
                          key={item.priority}
                          className="flex items-center justify-between p-3 bg-muted rounded-lg"
                        >
                          <span className="text-sm">{translateCasePriority(item.priority as CasePriority)}</span>
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

            {/* Charts Section */}
            {metrics && (
              <div className="pt-6 border-t space-y-6">
                <div>
                  <h4 className="text-lg font-semibold mb-4">Visualización Gráfica</h4>
                  <CaseMetricsCharts
                    casesByStatus={metrics.casesByStatus}
                    casesByViolenceType={metrics.casesByViolenceType}
                    casesByPriority={metrics.casesByPriority}
                    casesBySchool={metrics.casesBySchool}
                    casesOverTime={metrics.casesOverTime}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : schools.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No se encontraron colegios
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Distrito</TableHead>
                    <TableHead className="text-center">Usuarios</TableHead>
                    {canManage && <TableHead className="text-right">Acciones</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.map((school) => (
                    <TableRow key={school.id}>
                      <TableCell className="font-medium">
                        {school.name}
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {school.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSchoolTypeBadgeColor(school.type)}>
                          {translateSchoolType(school.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>{school.district || "-"}</TableCell>
                      <TableCell className="text-center">
                        <Link
                          href={`/schools/${school.id}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Users className="h-4 w-4" />
                          {school._count.users}
                        </Link>
                      </TableCell>
                      {canManage && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(school)}
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(school)}
                              title="Eliminar"
                              disabled={school._count.users > 0}
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
        open={modalOpen}
        onOpenChange={handleModalClose}
        school={editingSchool}
        onSuccess={fetchSchools}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el colegio{" "}
              <strong>{deletingSchool?.name}</strong>. Esta acción no se puede deshacer.
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
