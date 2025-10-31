"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Filter,
  Book,
  Upload,
  Download,
  Trash2,
  Edit,
  Check,
  FileText,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  Building2,
  User,
} from "lucide-react";
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
import { LibraryUploadModal } from "@/components/library/LibraryUploadModal";
import { LibraryEditModal } from "@/components/library/LibraryEditModal";
import {
  translateLibraryVisibility,
  getLibraryVisibilityBadgeColor,
  translateRole,
} from "@/lib/translations";
import { LibraryVisibility, Role } from "@prisma/client";
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

interface LibraryItem {
  id: string;
  title: string;
  description: string | null;
  fileName: string;
  fileUrl: string;
  fileSize: string | bigint;
  mimeType: string;
  visibility: LibraryVisibility;
  isApproved: boolean;
  approvedAt: string | null;
  createdBy: string;
  schoolId: string | null;
  createdAt: string;
  creator: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
  school: {
    id: string;
    name: string;
    code: string;
  } | null;
  approver: {
    id: string;
    name: string;
    email: string;
  } | null;
}

interface Profile {
  id: string;
  role: Role;
  schoolId?: string | null;
}

export default function LibraryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<LibraryItem[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<LibraryItem | null>(null);
  const [itemToEdit, setItemToEdit] = useState<LibraryItem | null>(null);
  const [pendingApprovalItems, setPendingApprovalItems] = useState<LibraryItem[]>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterVisibility, setFilterVisibility] = useState<string>("all");

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
        const profileData = data.profile || data;
        setProfile(profileData);
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
      });
  }, [router]);

  // Fetch library items
  const fetchItems = () => {
    setLoading(true);
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: "20",
    });
    if (searchTerm) params.append("search", searchTerm);
    if (filterVisibility && filterVisibility !== "all") {
      params.append("visibility", filterVisibility);
    }

    fetch(`/api/library?${params.toString()}`)
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
        setItems(data.items || []);
        setTotalPages(data.pagination?.totalPages || 1);

        // Separate pending approval items for admins
        if (profile && (profile.role === "ADMIN" || profile.role === "SUPER_ADMIN")) {
          const pending = (data.items || []).filter(
            (item: LibraryItem) =>
              item.visibility === "PUBLIC" && !item.isApproved && item.creator.role === "DIRECTOR"
          );
          setPendingApprovalItems(pending);
        }
      })
      .catch((error) => {
        console.error("Error fetching items:", error);
        toast({
          title: "Error",
          description: "Error al cargar los elementos",
          variant: "destructive",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (profile) {
      fetchItems();
    }
  }, [profile, currentPage, searchTerm, filterVisibility]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchItems();
  };

  const handleApproval = async (itemId: string, approve: boolean) => {
    if (!approve) return; // Only approval for now

    try {
      const response = await fetch(`/api/library/${itemId}/approve`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al aprobar el elemento");
      }

      toast({
        title: "Elemento aprobado",
        description: "El archivo público ahora es visible para todos",
      });

      fetchItems();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al aprobar el elemento",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;

    try {
      const response = await fetch(`/api/library/${itemToDelete.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar el elemento");
      }

      toast({
        title: "Elemento eliminado",
        description: "El archivo ha sido eliminado exitosamente",
      });

      setDeleteDialogOpen(false);
      setItemToDelete(null);
      fetchItems();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al eliminar el elemento",
        variant: "destructive",
      });
    }
  };

  const canUpload = profile && (profile.role === "ADMIN" || profile.role === "SUPER_ADMIN" || profile.role === "DIRECTOR");
  const isAdmin = profile && (profile.role === "ADMIN" || profile.role === "SUPER_ADMIN");

  const formatFileSize = (bytes: string | bigint): string => {
    const size = typeof bytes === "string" ? parseInt(bytes, 10) : Number(bytes);
    if (size < 1024) return size + " B";
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
    return (size / (1024 * 1024)).toFixed(1) + " MB";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const canEditItem = (item: LibraryItem) => {
    if (!profile) return false;
    return (
      isAdmin ||
      (profile.role === "DIRECTOR" &&
        item.createdBy === profile.id &&
        item.schoolId === profile.schoolId)
    );
  };

  const canDeleteItem = (item: LibraryItem) => {
    return canEditItem(item);
  };

  if (!profile) {
    return (
      <div className="container mx-auto py-6 space-y-6 px-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  // Check if user has access
  if (profile.role !== "ADMIN" && profile.role !== "SUPER_ADMIN" && profile.role !== "DIRECTOR" && profile.role !== "PROFESOR") {
    return (
      <div className="container mx-auto py-6 space-y-6 px-4">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Book className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">Acceso Denegado</h3>
            <p className="text-muted-foreground text-center">
              No tienes permisos para acceder a la biblioteca
            </p>
          </CardContent>
        </Card>
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
              <Book className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
            </div>
            <span>Biblioteca</span>
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            Recursos educativos compartidos
          </p>
        </div>
        {canUpload && (
          <Button onClick={() => setShowUploadModal(true)} className="w-full sm:w-auto shrink-0">
            <Upload className="mr-2 h-4 w-4" />
            Subir Archivo
          </Button>
        )}
      </div>

      {/* Pending Approval Banner (for admins) */}
      {isAdmin && pendingApprovalItems.length > 0 && (
        <Card className="border-2 border-yellow-500/50 bg-yellow-500/10">
          <CardContent className="pt-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">
                    {pendingApprovalItems.length} archivo{pendingApprovalItems.length !== 1 ? "s" : ""} pendiente{pendingApprovalItems.length !== 1 ? "s" : ""} de aprobación
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Hay archivos públicos subidos por directores que requieren tu aprobación
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Search */}
            <div className="sm:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input
                  placeholder="Buscar por título, descripción o nombre de archivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-9 h-10"
                />
              </div>
            </div>

            {/* Visibility Filter */}
            {isAdmin && (
              <Select
                value={filterVisibility}
                onValueChange={(value) => {
                  setFilterVisibility(value);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="h-10">
                  <SelectValue placeholder="Visibilidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las visibilidades</SelectItem>
                  <SelectItem value="PUBLIC">Público</SelectItem>
                  <SelectItem value="PRIVATE">Privado</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Items Grid */}
      {loading ? (
        <Card className="border-2 shadow-sm">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-48 w-full rounded-md" />
              ))}
            </div>
          </CardContent>
        </Card>
      ) : items.length === 0 ? (
        <Card className="border-2 shadow-sm">
          <CardContent className="flex flex-col items-center justify-center py-16 px-4">
            <div className="p-4 rounded-full bg-muted mb-4">
              <Book className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No se encontraron archivos</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {searchTerm || filterVisibility !== "all"
                ? "Intenta ajustar los filtros de búsqueda"
                : "Aún no hay archivos en la biblioteca"}
            </p>
            {canUpload && (
              <Button onClick={() => setShowUploadModal(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Subir Primer Archivo
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => (
            <Card
              key={item.id}
              className="hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/20"
            >
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg line-clamp-2 mb-2">{item.title}</CardTitle>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={`${getLibraryVisibilityBadgeColor(item.visibility)} text-xs font-medium border px-2 py-0.5`}>
                        {translateLibraryVisibility(item.visibility)}
                      </Badge>
                      {item.visibility === "PUBLIC" && !item.isApproved && item.creator.role === "DIRECTOR" && (
                        <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-700 dark:text-yellow-400">
                          Pendiente
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {item.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {item.description}
                  </p>
                )}

                <div className="space-y-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <FileText className="h-3 w-3 shrink-0" />
                    <span className="truncate">{item.fileName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 shrink-0" />
                    <span>{item.creator.name} ({translateRole(item.creator.role)})</span>
                  </div>
                  {item.school && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-3 w-3 shrink-0" />
                      <span>{item.school.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span>{formatDate(item.createdAt)}</span>
                  </div>
                </div>

                <div className="pt-2 border-t flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {formatFileSize(item.fileSize)}
                  </span>
                  <div className="flex items-center gap-1">
                    {isAdmin && item.visibility === "PUBLIC" && !item.isApproved && item.creator.role === "DIRECTOR" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() => handleApproval(item.id, true)}
                        title="Aprobar"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    )}
                    {canEditItem(item) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8"
                        onClick={() => setItemToEdit(item)}
                        title="Editar"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                    )}
                    {canDeleteItem(item) && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 text-destructive hover:text-destructive"
                        onClick={() => {
                          setItemToDelete(item);
                          setDeleteDialogOpen(true);
                        }}
                        title="Eliminar"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                    {profile?.role === "PROFESOR" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8"
                        onClick={() => window.open(item.fileUrl, "_blank")}
                        title="Ver archivo"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="default"
                      className="h-8"
                      onClick={async () => {
                        try {
                          const response = await fetch(item.fileUrl);
                          const blob = await response.blob();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = item.fileName;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: "Error al descargar el archivo",
                            variant: "destructive",
                          });
                        }
                      }}
                      title="Descargar archivo"
                    >
                      <Download className="h-3 w-3" />
                    </Button>
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

      {/* Upload Modal */}
      {canUpload && (
        <LibraryUploadModal
          open={showUploadModal}
          onOpenChange={setShowUploadModal}
          onSuccess={fetchItems}
          userRole={profile.role}
        />
      )}

      {/* Edit Modal */}
      {itemToEdit && (
        <LibraryEditModal
          open={!!itemToEdit}
          onOpenChange={(open) => !open && setItemToEdit(null)}
          item={itemToEdit}
          onSuccess={() => {
            setItemToEdit(null);
            fetchItems();
          }}
          userRole={profile.role}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar archivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el archivo "{itemToDelete?.title}". Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

