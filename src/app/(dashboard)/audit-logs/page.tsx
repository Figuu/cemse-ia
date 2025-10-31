"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, History } from "lucide-react";
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
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  description: string | null;
  changes: any;
  metadata: any;
  ipAddress: string | null;
  userAgent: string | null;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
}

interface Profile {
  id: string;
  role: string;
}

const ENTITY_TYPES = ["User", "School", "Case", "Profile"];

const ACTION_COLORS: Record<string, string> = {
  CREATED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  UPDATED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  DELETED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  LOGIN: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  LOGOUT: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  PASSWORD: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
};

function getActionColor(action: string): string {
  for (const [key, color] of Object.entries(ACTION_COLORS)) {
    if (action.includes(key)) {
      return color;
    }
  }
  return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
}

export default function AuditLogsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterEntityType, setFilterEntityType] = useState<string>("");
  const [filterAction, setFilterAction] = useState<string>("");

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

        // Only ADMIN and SUPER_ADMIN can access audit logs
        if (data.role !== "ADMIN" && data.role !== "SUPER_ADMIN") {
          toast({
            title: "Acceso Denegado",
            description: "No tienes permisos para ver los registros de auditoría",
            variant: "destructive",
          });
          router.push("/dashboard");
          return;
        }

        setProfile(data);
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

  // Fetch audit logs
  const fetchLogs = () => {
    setLoading(true);

    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: "50",
    });

    if (searchTerm) params.append("action", searchTerm);
    if (filterEntityType) params.append("entityType", filterEntityType);
    if (filterAction) params.append("action", filterAction);

    fetch(`/api/audit-logs?${params.toString()}`)
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
        setLogs(data.logs || []);
        setTotalPages(data.pagination?.totalPages || 1);
      })
      .catch((error) => {
        console.error("Error fetching logs:", error);
        toast({
          title: "Error",
          description: "Error al cargar los registros",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (profile) {
      fetchLogs();
    }
  }, [profile, currentPage, filterEntityType, filterAction]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchLogs();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterEntityType("");
    setFilterAction("");
    setCurrentPage(1);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const formatChanges = (changes: any) => {
    if (!changes) return null;

    return (
      <div className="text-xs space-y-1 max-w-md">
        {Object.entries(changes).map(([key, value]: [string, any]) => (
          <div key={key} className="border-l-2 border-gray-300 pl-2">
            <span className="font-medium">{key}:</span>
            {value?.from !== undefined && (
              <span className="text-red-600 line-through ml-1">
                {JSON.stringify(value.from)}
              </span>
            )}
            {value?.to !== undefined && (
              <span className="text-green-600 ml-1">
                → {JSON.stringify(value.to)}
              </span>
            )}
          </div>
        ))}
      </div>
    );
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
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <History className="h-8 w-8" />
            Registros de Auditoría
          </h1>
          <p className="text-muted-foreground">
            Historial completo de todas las acciones del sistema
          </p>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por acción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-9"
                  />
                </div>
                <Button onClick={handleSearch}>Buscar</Button>
              </div>
            </div>

            {/* Entity Type Filter */}
            <Select
              value={filterEntityType}
              onValueChange={(value) => {
                setFilterEntityType(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo de entidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas las entidades</SelectItem>
                {ENTITY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button variant="outline" onClick={clearFilters}>
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <History className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No se encontraron registros
            </h3>
            <p className="text-muted-foreground text-center">
              {searchTerm || filterEntityType
                ? "Intenta ajustar los filtros de búsqueda"
                : "No hay registros de auditoría disponibles"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fecha/Hora</TableHead>
                    <TableHead>Acción</TableHead>
                    <TableHead>Entidad</TableHead>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Descripción</TableHead>
                    <TableHead>Cambios</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm whitespace-nowrap">
                        {formatDateTime(log.createdAt)}
                      </TableCell>
                      <TableCell>
                        <Badge className={getActionColor(log.action)}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>
                          <div className="font-medium">{log.entityType}</div>
                          <div className="text-xs text-muted-foreground truncate max-w-[100px]">
                            {log.entityId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div>
                          <div className="font-medium">{log.user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {log.user.role}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm max-w-xs">
                        {log.description || "-"}
                      </TableCell>
                      <TableCell>
                        {log.changes ? formatChanges(log.changes) : "-"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {log.ipAddress || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
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
    </div>
  );
}
