"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, FileText, ChevronLeft, ChevronRight, Calendar, User, Building2, AlertTriangle } from "lucide-react";
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
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ViolenceType, CaseStatus, CasePriority } from "@prisma/client";
import {
  translateViolenceType,
  translateCaseStatus,
  translateCasePriority,
  getViolenceTypeBadgeColor,
  getCaseStatusBadgeColor,
  getCasePriorityBadgeColor,
} from "@/lib/translations";
import { CaseModal } from "@/components/cases/CaseModal";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface CaseData {
  id: string;
  caseNumber: string;
  incidentDate: string;
  violenceType: ViolenceType;
  status: CaseStatus;
  priority: CasePriority;
  victimName: string;
  victimIsAnonymous: boolean;
  aggressorName: string;
  school: {
    id: string;
    name: string;
    code: string;
  };
  creator: {
    id: string;
    name: string;
    role: string;
  };
  createdAt: string;
}

interface Profile {
  id: string;
  role: string;
  schoolId?: string;
}

export default function CasesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [cases, setCases] = useState<CaseData[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterViolenceType, setFilterViolenceType] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterPriority, setFilterPriority] = useState<string>("");

  const [showCreateModal, setShowCreateModal] = useState(false);

  // Fetch profile
  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast({
            title: "Error",
            description: data.error,
            variant: "destructive",
          });
          router.push("/dashboard");
          return;
        }
        // The API returns { success: true, profile: ... }, so extract the profile
        setProfile(data.profile || data);
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Error al cargar el perfil",
          variant: "destructive",
        });
      });
  }, [router]);

  // Fetch cases
  const fetchCases = () => {
    setLoading(true);

    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: "10",
    });

    if (searchTerm) params.append("search", searchTerm);
    if (filterViolenceType) params.append("violenceType", filterViolenceType);
    if (filterStatus) params.append("status", filterStatus);
    if (filterPriority) params.append("priority", filterPriority);

    fetch(`/api/cases?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast({
            title: "Error",
            description: data.error,
            variant: "destructive",
          });
          return;
        }
        setCases(data.cases || []);
        setTotalPages(data.pagination?.totalPages || 1);
      })
      .catch((error) => {
        console.error("Error fetching cases:", error);
        toast({
          title: "Error",
          description: "Error al cargar los casos",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (profile) {
      fetchCases();
    }
  }, [profile, currentPage, searchTerm, filterViolenceType, filterStatus, filterPriority]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (type: string, value: string) => {
    const actualValue = value === "all" ? "" : value;
    if (type === "violenceType") setFilterViolenceType(actualValue);
    if (type === "status") setFilterStatus(actualValue);
    if (type === "priority") setFilterPriority(actualValue);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterViolenceType("");
    setFilterStatus("");
    setFilterPriority("");
    setCurrentPage(1);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const canCreateCase = profile?.role === "DIRECTOR" ||
                        profile?.role === "PROFESOR" ||
                        profile?.role === "ADMIN" ||
                        profile?.role === "SUPER_ADMIN";

  // For directors and teachers, they must have a school assigned
  const canActuallyCreateCase = canCreateCase && 
    ((profile?.role === "DIRECTOR" || profile?.role === "PROFESOR") 
      ? !!profile?.schoolId 
      : true);

  const handleCreateCase = () => {
    if (canActuallyCreateCase) {
      setShowCreateModal(true);
    } else {
      toast({
        title: "Error",
        description: "Debes tener un colegio asignado para crear casos",
        variant: "destructive",
      });
    }
  };

  if (!profile) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6 px-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <FileText className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            </div>
            <span>Casos de Violencia</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Gestiona y da seguimiento a los reportes de violencia escolar
          </p>
        </div>
        {canCreateCase && (
          <Button onClick={handleCreateCase} className="w-full sm:w-auto shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            Reportar Caso
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="border-b bg-muted/30">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Filter className="h-4 w-4 text-primary" />
            </div>
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="sm:col-span-2 lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  placeholder="Buscar por número, víctima, agresor..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
            </div>

            {/* Violence Type Filter */}
            <Select
              value={filterViolenceType || "all"}
              onValueChange={(value) => handleFilterChange("violenceType", value)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Tipo de violencia" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                {Object.values(ViolenceType).map((type) => (
                  <SelectItem key={type} value={type}>
                    {translateViolenceType(type)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={filterStatus || "all"}
              onValueChange={(value) => handleFilterChange("status", value)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                {Object.values(CaseStatus).map((status) => (
                  <SelectItem key={status} value={status}>
                    {translateCaseStatus(status)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Priority Filter */}
            <Select
              value={filterPriority || "all"}
              onValueChange={(value) => handleFilterChange("priority", value)}
            >
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Prioridad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las prioridades</SelectItem>
                {Object.values(CasePriority).map((priority) => (
                  <SelectItem key={priority} value={priority}>
                    {translateCasePriority(priority)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(searchTerm || filterViolenceType || filterStatus || filterPriority) && (
            <div className="mt-4">
              <Button variant="outline" size="sm" onClick={clearFilters} className="w-full sm:w-auto">
                Limpiar Filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cases List */}
      {loading ? (
        <Card className="border-2 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-32 w-full rounded-md" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : cases.length === 0 ? (
        <Card className="border-2 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 px-4">
            <div className="p-4 rounded-full bg-muted mb-4">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No se encontraron casos</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {searchTerm || filterViolenceType || filterStatus || filterPriority
                ? "Intenta ajustar los filtros de búsqueda para encontrar más resultados"
                : "No hay casos registrados aún"}
            </p>
            {canCreateCase && (
              <Button onClick={handleCreateCase}>
                <Plus className="mr-2 h-4 w-4" />
                Reportar Primer Caso
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {cases.map((caseData) => (
            <Card
              key={caseData.id}
              className="hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-primary/20"
              onClick={() => router.push(`/cases/${caseData.id}`)}
            >
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col gap-4">
                  {/* Header with case number and badges */}
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div className="flex-1 space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-wrap">
                        <h3 className="text-lg sm:text-xl font-bold">
                          {caseData.caseNumber}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={`${getViolenceTypeBadgeColor(caseData.violenceType)} text-xs font-medium border px-2.5 py-0.5`}>
                            {translateViolenceType(caseData.violenceType)}
                          </Badge>
                          <Badge className={`${getCaseStatusBadgeColor(caseData.status)} text-xs font-medium border px-2.5 py-0.5`}>
                            {translateCaseStatus(caseData.status)}
                          </Badge>
                          <Badge className={`${getCasePriorityBadgeColor(caseData.priority)} text-xs font-medium border px-2.5 py-0.5`}>
                            {translateCasePriority(caseData.priority)}
                          </Badge>
                        </div>
                      </div>

                      {/* Main case info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground mb-0.5">Víctima</p>
                              <p className="text-sm font-medium">
                                {caseData.victimIsAnonymous
                                  ? "Anónimo"
                                  : caseData.victimName}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <User className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground mb-0.5">Agresor</p>
                              <p className="text-sm font-medium">{caseData.aggressorName}</p>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-start gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground mb-0.5">Fecha del incidente</p>
                              <p className="text-sm font-medium">{formatDate(caseData.incidentDate)}</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-muted-foreground mb-0.5">Colegio</p>
                              <p className="text-sm font-medium">
                                {caseData.school.name} <span className="text-muted-foreground">({caseData.school.code})</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer with metadata */}
                  <div className="pt-3 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm text-muted-foreground">
                    <div className="flex flex-wrap items-center gap-3">
                      <span>
                        <span className="font-medium">Reportado por:</span> {caseData.creator.name}
                      </span>
                    </div>
                    <span>
                      <span className="font-medium">Fecha de reporte:</span> {formatDate(caseData.createdAt)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <Card className="border-2 shadow-sm">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-muted-foreground font-medium">
                Mostrando página <span className="text-foreground font-semibold">{currentPage}</span> de <span className="text-foreground font-semibold">{totalPages}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="gap-1.5"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span className="hidden sm:inline">Anterior</span>
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-10 font-medium"
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="gap-1.5"
                >
                  <span className="hidden sm:inline">Siguiente</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Modal */}
      {showCreateModal && profile && (
        <CaseModal
          open={showCreateModal}
          onOpenChange={setShowCreateModal}
          schoolId={profile.schoolId || undefined}
          onSuccess={fetchCases}
        />
      )}
    </div>
  );
}
