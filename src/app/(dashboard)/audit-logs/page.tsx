"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, History, Clock, User, FileText, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
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
  changes: Record<string, { from?: unknown; to?: unknown }> | null;
  metadata: Record<string, unknown> | null;
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
  CREATED: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30",
  UPDATED: "bg-blue-500/10 text-blue-700 border-blue-500/20 dark:bg-blue-500/20 dark:text-blue-400 dark:border-blue-500/30",
  DELETED: "bg-red-500/10 text-red-700 border-red-500/20 dark:bg-red-500/20 dark:text-red-400 dark:border-red-500/30",
  LOGIN: "bg-purple-500/10 text-purple-700 border-purple-500/20 dark:bg-purple-500/20 dark:text-purple-400 dark:border-purple-500/30",
  LOGOUT: "bg-slate-500/10 text-slate-700 border-slate-500/20 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30",
  PASSWORD: "bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-500/20 dark:text-amber-400 dark:border-amber-500/30",
};

function getActionColor(action: string): string {
  for (const [key, color] of Object.entries(ACTION_COLORS)) {
    if (action.includes(key)) {
      return color;
    }
  }
  return "bg-slate-500/10 text-slate-700 border-slate-500/20 dark:bg-slate-500/20 dark:text-slate-400 dark:border-slate-500/30";
}

export default function AuditLogsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterEntityType, setFilterEntityType] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("");
  const [expandedChanges, setExpandedChanges] = useState<Set<string>>(new Set());

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

        // Extract profile from response
        const profileData = data.profile || data;
        const userRole = profileData.role;

        // Only ADMIN and SUPER_ADMIN can access audit logs
        if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
          toast({
            title: "Acceso Denegado",
            description: "No tienes permisos para ver los registros de auditoría",
            variant: "destructive",
          });
          router.push("/dashboard");
          return;
        }

        setProfile(profileData);
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
    if (filterEntityType && filterEntityType !== "all") params.append("entityType", filterEntityType);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, currentPage, filterEntityType, filterAction]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchLogs();
  };

  const clearFilters = () => {
    setSearchTerm("");
    setFilterEntityType("all");
    setFilterAction("");
    setCurrentPage(1);
  };


  const toggleChanges = (logId: string) => {
    setExpandedChanges((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(logId)) {
        newSet.delete(logId);
      } else {
        newSet.add(logId);
      }
      return newSet;
    });
  };

  const formatValue = (value: unknown, isExpanded: boolean = false): string => {
    if (value === null || value === undefined) return "null";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);

    if (Array.isArray(value)) {
      if (isExpanded) {
        return JSON.stringify(value, null, 2);
      }
      return `[${value.length} elemento${value.length !== 1 ? "s" : ""}]`;
    }

    if (typeof value === "object") {
      if (isExpanded) {
        return JSON.stringify(value, null, 2);
      }
      const keys = Object.keys(value);
      return `{${keys.length} propiedad${keys.length !== 1 ? "es" : ""}}`;
    }

    return String(value);
  };

  const formatChanges = (changes: Record<string, { from?: unknown; to?: unknown }> | null, isExpanded: boolean = false) => {
    if (!changes || typeof changes !== "object") return null;

    const entries = Object.entries(changes);
    if (entries.length === 0) return null;

    const displayEntries = isExpanded ? entries : entries.slice(0, 2);

    return (
      <div className="text-xs space-y-2">
        {displayEntries.map(([key, value]: [string, { from?: unknown; to?: unknown }]) => (
          <div key={key} className="border-l-2 border-blue-300 dark:border-blue-700 pl-2 py-0.5">
            <span className="font-medium text-foreground">{key}:</span>
            {value?.from !== undefined && (
              <div className="text-red-600 dark:text-red-400 line-through mt-0.5 break-words">
                {formatValue(value.from, isExpanded)}
              </div>
            )}
            {value?.to !== undefined && (
              <div className="text-green-600 dark:text-green-400 mt-0.5 break-words">
                → {formatValue(value.to, isExpanded)}
              </div>
            )}
          </div>
        ))}
        {!isExpanded && entries.length > 2 && (
          <div className="text-muted-foreground text-xs italic">
            +{entries.length - 2} más...
          </div>
        )}
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
    <div className="container mx-auto py-8 space-y-6 px-4">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <History className="h-7 w-7 text-primary" />
            </div>
            <span>Registros de Auditoría</span>
          </h1>
          <p className="text-muted-foreground text-base">
            Historial completo de todas las acciones del sistema
          </p>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Input
                    placeholder="Buscar por acción..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-9 h-10"
                  />
                </div>
                <Button onClick={handleSearch} className="h-10">
                  Buscar
                </Button>
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
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Tipo de entidad" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las entidades</SelectItem>
                {ENTITY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            <Button variant="outline" onClick={clearFilters} className="h-10">
              Limpiar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      {loading ? (
        <Card className="border-2 shadow-sm">
          <CardContent className="p-6">
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-md" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : logs.length === 0 ? (
        <Card className="border-2 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="p-4 rounded-full bg-muted mb-4">
              <History className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              No se encontraron registros
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              {searchTerm || filterEntityType !== "all"
                ? "Intenta ajustar los filtros de búsqueda para encontrar más resultados"
                : "No hay registros de auditoría disponibles en este momento"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 shadow-sm overflow-hidden">
          <CardHeader className="border-b bg-gradient-to-r from-muted/50 to-muted/30">
            <CardTitle className="flex items-center justify-between">
              <span className="text-xl">Registros de Auditoría</span>
              <Badge variant="secondary" className="text-sm font-medium">
                {logs.length} {logs.length === 1 ? "registro" : "registros"}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="w-[180px] font-semibold">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        <span>Fecha/Hora</span>
                      </div>
                    </TableHead>
                    <TableHead className="w-[120px] font-semibold">Acción</TableHead>
                    <TableHead className="w-[150px] font-semibold">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-primary" />
                        <span>Entidad</span>
                      </div>
                    </TableHead>
                    <TableHead className="w-[180px] font-semibold">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-primary" />
                        <span>Usuario</span>
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[200px] font-semibold">Descripción</TableHead>
                    <TableHead className="w-[150px] font-semibold">Cambios</TableHead>
                    <TableHead className="w-[120px] font-semibold">IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow 
                      key={log.id} 
                      className="hover:bg-muted/50 transition-colors border-b last:border-b-0"
                    >
                      <TableCell className="text-sm whitespace-nowrap">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium">
                            {new Date(log.createdAt).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(log.createdAt).toLocaleTimeString("es-ES", {
                              hour: "2-digit",
                              minute: "2-digit",
                              second: "2-digit",
                            })}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getActionColor(log.action)} text-xs font-medium border px-2.5 py-0.5`}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium">{log.entityType}</span>
                          <span className="text-xs text-muted-foreground font-mono truncate max-w-[120px]" title={log.entityId}>
                            {log.entityId}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{log.user.name}</span>
                          <div className="flex items-center gap-1.5">
                            <Badge variant="outline" className="text-xs px-2 py-0.5 font-medium">
                              {log.user.role}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground truncate max-w-[150px]">
                            {log.user.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="max-w-[200px] truncate" title={log.description || undefined}>
                          {log.description || (
                            <span className="text-muted-foreground italic">Sin descripción</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {log.changes ? (
                          <div className="space-y-2">
                            <div className="flex items-start gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0 shrink-0 mt-0.5"
                                onClick={() => toggleChanges(log.id)}
                                title={expandedChanges.has(log.id) ? "Colapsar" : "Expandir"}
                              >
                                {expandedChanges.has(log.id) ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                              <div className="flex-1 min-w-0">
                                {formatChanges(log.changes, expandedChanges.has(log.id))}
                              </div>
                            </div>
                            {expandedChanges.has(log.id) && (
                              <details className="mt-2 ml-8">
                                <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground mb-1">
                                  Ver JSON completo
                                </summary>
                                <pre className="text-[10px] bg-muted p-2 rounded overflow-auto max-h-48 border">
                                  {JSON.stringify(log.changes, null, 2)}
                                </pre>
                              </details>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm italic">Sin cambios</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs">
                        {log.ipAddress ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="font-mono text-muted-foreground truncate block" title={log.ipAddress}>
                              {log.ipAddress}
                            </span>
                            {log.userAgent && (
                              <span className="text-[10px] text-muted-foreground truncate max-w-[100px]" title={log.userAgent}>
                                {log.userAgent.substring(0, 30)}...
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
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
                  Anterior
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
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
