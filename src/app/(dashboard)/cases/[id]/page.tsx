"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, FileText, Calendar, MapPin, User, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import { getFileIcon, formatFileSize } from "@/lib/storage";

interface CaseData {
  id: string;
  caseNumber: string;
  incidentDate: string;
  incidentTime: string;
  violenceType: ViolenceType;
  description: string;
  location: string;
  customLocation?: string;
  status: CaseStatus;
  priority: CasePriority;
  victimName: string;
  victimIsAnonymous: boolean;
  victimAge?: number;
  victimGrade?: string;
  aggressorName: string;
  aggressorDescription?: string;
  relationshipToVictim?: string;
  witnesses?: string;
  evidenceFiles?: Array<{
    name: string;
    url: string;
    type: string;
    size: number;
    uploadedAt: string;
  }>;
  school: {
    id: string;
    name: string;
    code: string;
    type: string;
  };
  creator: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface Profile {
  id: string;
  role: string;
  schoolId?: string;
}

export default function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [caseData, setCaseData] = useState<CaseData | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
        setProfile(data);
      })
      .catch((error) => {
        console.error("Error fetching profile:", error);
      });
  }, [router]);

  // Fetch case data
  const fetchCase = () => {
    setLoading(true);
    fetch(`/api/cases/${resolvedParams.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast({
            title: "Error",
            description: data.error,
            variant: "destructive",
          });
          router.push("/cases");
          return;
        }
        setCaseData(data);
      })
      .catch((error) => {
        console.error("Error fetching case:", error);
        toast({
          title: "Error",
          description: "Error al cargar el caso",
          variant: "destructive",
        });
        router.push("/cases");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (profile) {
      fetchCase();
    }
  }, [profile, resolvedParams.id]);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/cases/${resolvedParams.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar el caso");
      }

      toast({
        title: "Caso eliminado exitosamente",
      });
      router.push("/cases");
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Error al eliminar el caso",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const canEdit =
    profile?.role === "ADMIN" ||
    profile?.role === "SUPER_ADMIN" ||
    (profile?.role === "DIRECTOR" && caseData?.school.id === profile?.schoolId) ||
    (profile?.role === "PROFESOR" && caseData?.school.id === profile?.schoolId);

  const canDelete = profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN";

  if (loading || !caseData || !profile) {
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
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/cases")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {caseData.caseNumber}
            </h1>
            <p className="text-muted-foreground">Detalles del caso</p>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <Button onClick={() => setShowEditModal(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          )}
          {canDelete && (
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </Button>
          )}
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex gap-2 flex-wrap">
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

      {/* Incident Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Detalles del Incidente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Fecha del Incidente
              </p>
              <p className="text-base flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {formatDate(caseData.incidentDate)} a las {caseData.incidentTime}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Ubicación
              </p>
              <p className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {caseData.customLocation || caseData.location}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Descripción
            </p>
            <p className="text-base whitespace-pre-wrap">{caseData.description}</p>
          </div>
        </CardContent>
      </Card>

      {/* Victim Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información de la Víctima
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nombre</p>
              <p className="text-base">
                {caseData.victimIsAnonymous ? (
                  <>
                    {caseData.victimName}{" "}
                    <Badge variant="outline" className="ml-2">
                      Anónimo
                    </Badge>
                  </>
                ) : (
                  caseData.victimName
                )}
              </p>
            </div>
            {caseData.victimAge && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Edad</p>
                <p className="text-base">{caseData.victimAge} años</p>
              </div>
            )}
            {caseData.victimGrade && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Grado/Curso
                </p>
                <p className="text-base">{caseData.victimGrade}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Aggressor Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información del Agresor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Nombre</p>
              <p className="text-base">{caseData.aggressorName}</p>
            </div>
            {caseData.relationshipToVictim && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Relación con la Víctima
                </p>
                <p className="text-base">{caseData.relationshipToVictim}</p>
              </div>
            )}
          </div>

          {caseData.aggressorDescription && (
            <>
              <Separator />
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Descripción
                </p>
                <p className="text-base whitespace-pre-wrap">
                  {caseData.aggressorDescription}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Witnesses */}
      {caseData.witnesses && (
        <Card>
          <CardHeader>
            <CardTitle>Testigos</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base whitespace-pre-wrap">{caseData.witnesses}</p>
          </CardContent>
        </Card>
      )}

      {/* Evidence Files */}
      {caseData.evidenceFiles && caseData.evidenceFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Archivos de Evidencia
            </CardTitle>
            <CardDescription>
              {caseData.evidenceFiles.length} archivo(s)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {caseData.evidenceFiles.map((file, index) => (
                <a
                  key={index}
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getFileIcon(file.type)}</span>
                    <div>
                      <p className="text-sm font-medium">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)} • Subido el{" "}
                        {formatDateTime(file.uploadedAt)}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    Ver
                  </Button>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* School and Reporter Info */}
      <Card>
        <CardHeader>
          <CardTitle>Información Adicional</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Colegio</p>
              <p className="text-base">
                {caseData.school.name} ({caseData.school.code})
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Reportado Por
              </p>
              <p className="text-base">
                {caseData.creator.name} ({caseData.creator.role})
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <p className="font-medium">Fecha de Creación</p>
              <p>{formatDateTime(caseData.createdAt)}</p>
            </div>
            <div>
              <p className="font-medium">Última Actualización</p>
              <p>{formatDateTime(caseData.updatedAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Modal */}
      {showEditModal && (
        <CaseModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          caseData={caseData}
          onSuccess={fetchCase}
        />
      )}

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este caso?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el caso {caseData.caseNumber}. Los datos no se
              perderán completamente y podrán ser recuperados por un administrador.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
