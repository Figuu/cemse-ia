"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, FileText } from "lucide-react";
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
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Casos de Violencia</h1>
          <p className="text-muted-foreground">
            Gestiona y da seguimiento a los reportes de violencia escolar
          </p>
        </div>
        {canCreateCase && (
          <Button onClick={handleCreateCase}>
            <Plus className="mr-2 h-4 w-4" />
            Reportar Caso
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número de caso, víctima, agresor..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Violence Type Filter */}
            <Select
              value={filterViolenceType || "all"}
              onValueChange={(value) => handleFilterChange("violenceType", value)}
            >
              <SelectTrigger>
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
              <SelectTrigger>
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
              <SelectTrigger>
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
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Limpiar Filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cases List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      ) : cases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron casos</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm || filterViolenceType || filterStatus || filterPriority
                ? "Intenta ajustar los filtros de búsqueda"
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
        <div className="space-y-4">
          {cases.map((caseData) => (
            <Card
              key={caseData.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push(`/cases/${caseData.id}`)}
            >
              <CardContent className="p-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  {/* Left side - Main info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-lg font-semibold">
                        {caseData.caseNumber}
                      </h3>
                      <Badge className={getViolenceTypeBadgeColor(caseData.violenceType)}>
                        {translateViolenceType(caseData.violenceType)}
                      </Badge>
                      <Badge className={getCaseStatusBadgeColor(caseData.status)}>
                        {translateCaseStatus(caseData.status)}
                      </Badge>
                      <Badge className={getCasePriorityBadgeColor(caseData.priority)}>
                        {translateCasePriority(caseData.priority)}
                      </Badge>
                    </div>

                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>
                        <span className="font-medium">Víctima:</span>{" "}
                        {caseData.victimIsAnonymous
                          ? "Anónimo"
                          : caseData.victimName}
                      </p>
                      <p>
                        <span className="font-medium">Agresor:</span>{" "}
                        {caseData.aggressorName}
                      </p>
                      <p>
                        <span className="font-medium">Fecha del incidente:</span>{" "}
                        {formatDate(caseData.incidentDate)}
                      </p>
                      <p>
                        <span className="font-medium">Colegio:</span>{" "}
                        {caseData.school.name} ({caseData.school.code})
                      </p>
                    </div>
                  </div>

                  {/* Right side - Meta info */}
                  <div className="text-sm text-muted-foreground space-y-1 md:text-right">
                    <p>
                      <span className="font-medium">Reportado por:</span>{" "}
                      {caseData.creator.name}
                    </p>
                    <p>
                      <span className="font-medium">Fecha de reporte:</span>{" "}
                      {formatDate(caseData.createdAt)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>
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
