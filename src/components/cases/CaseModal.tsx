"use client";

import { useState, useEffect } from "react";
import { ViolenceType, CaseStatus, CasePriority } from "@prisma/client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  translateViolenceType,
  translateCaseStatus,
  translateCasePriority,
} from "@/lib/translations";
import { toast } from "@/hooks/use-toast";
import { Loader2, Upload, X } from "lucide-react";
import {
  validateEvidenceFile,
  formatFileSize,
  getFileIcon,
  type UploadedFile,
} from "@/lib/storage";

interface CaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caseData?: any | null;
  schoolId?: string;
  onSuccess?: () => void;
}

const LOCATION_OPTIONS = [
  { value: "CLASSROOM", label: "Sala de clases" },
  { value: "HALLWAY", label: "Pasillo" },
  { value: "BATHROOM", label: "Baño" },
  { value: "PLAYGROUND", label: "Patio de recreo" },
  { value: "CAFETERIA", label: "Cafetería" },
  { value: "GYM", label: "Gimnasio" },
  { value: "PARKING", label: "Estacionamiento" },
  { value: "BUS", label: "Bus escolar" },
  { value: "ONLINE", label: "En línea/Virtual" },
  { value: "OTHER", label: "Otro" },
];

export function CaseModal({
  open,
  onOpenChange,
  caseData,
  schoolId,
  onSuccess,
}: CaseModalProps) {
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const [formData, setFormData] = useState({
    incidentDate: "",
    incidentTime: "",
    violenceType: "VERBAL" as ViolenceType,
    description: "",
    location: "CLASSROOM",
    customLocation: "",
    victimIsAnonymous: false,
    victimName: "",
    victimAge: "",
    victimGrade: "",
    aggressorName: "",
    aggressorDescription: "",
    relationshipToVictim: "",
    witnesses: "",
    status: "OPEN" as CaseStatus,
    priority: "MEDIUM" as CasePriority,
  });

  // Load case data when editing
  useEffect(() => {
    if (caseData) {
      setFormData({
        incidentDate: caseData.incidentDate
          ? new Date(caseData.incidentDate).toISOString().split("T")[0]
          : "",
        incidentTime: caseData.incidentTime || "",
        violenceType: caseData.violenceType || "VERBAL",
        description: caseData.description || "",
        location: caseData.location || "CLASSROOM",
        customLocation: caseData.customLocation || "",
        victimIsAnonymous: caseData.victimIsAnonymous || false,
        victimName: caseData.victimName || "",
        victimAge: caseData.victimAge?.toString() || "",
        victimGrade: caseData.victimGrade || "",
        aggressorName: caseData.aggressorName || "",
        aggressorDescription: caseData.aggressorDescription || "",
        relationshipToVictim: caseData.relationshipToVictim || "",
        witnesses: caseData.witnesses || "",
        status: caseData.status || "OPEN",
        priority: caseData.priority || "MEDIUM",
      });
      setUploadedFiles(caseData.evidenceFiles || []);
      setSelectedFiles([]);
    } else {
      // Reset form when creating new
      const now = new Date();
      setFormData({
        incidentDate: now.toISOString().split("T")[0],
        incidentTime: now.toTimeString().slice(0, 5),
        violenceType: "VERBAL",
        description: "",
        location: "CLASSROOM",
        customLocation: "",
        victimIsAnonymous: false,
        victimName: "",
        victimAge: "",
        victimGrade: "",
        aggressorName: "",
        aggressorDescription: "",
        relationshipToVictim: "",
        witnesses: "",
        status: "OPEN",
        priority: "MEDIUM",
      });
      setUploadedFiles([]);
      setSelectedFiles([]);
    }
  }, [caseData, open]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Validate each file
    const validFiles: File[] = [];
    for (const file of files) {
      const validation = validateEvidenceFile(file);
      if (!validation.valid) {
        toast({
          title: `Error con ${file.name}`,
          description: validation.error,
          variant: "destructive",
        });
      } else {
        validFiles.push(file);
      }
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    // Reset input
    e.target.value = "";
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Prepare data
      const submitData: any = {
        incidentDate: formData.incidentDate,
        incidentTime: formData.incidentTime,
        violenceType: formData.violenceType,
        description: formData.description,
        location: formData.location,
        customLocation:
          formData.location === "OTHER" ? formData.customLocation : null,
        victimIsAnonymous: formData.victimIsAnonymous,
        victimName: formData.victimName,
        victimAge: formData.victimAge ? parseInt(formData.victimAge) : null,
        victimGrade: formData.victimGrade || null,
        aggressorName: formData.aggressorName,
        aggressorDescription: formData.aggressorDescription || null,
        relationshipToVictim: formData.relationshipToVictim || null,
        witnesses: formData.witnesses || null,
        status: formData.status,
        priority: formData.priority,
        evidenceFiles: uploadedFiles,
      };

      if (!caseData && schoolId) {
        submitData.schoolId = schoolId;
      }

      // If there are new files to upload, upload them first
      if (selectedFiles.length > 0 && !caseData) {
        // Note: We can't upload files yet without a case ID
        // In a real implementation, you might want to:
        // 1. Create the case first with a temporary ID
        // 2. Upload files with that ID
        // 3. Update the case with file URLs
        // For now, we'll include this note in the upload
        toast({
          title: "Nota",
          description:
            "Los archivos se subirán después de crear el caso. Esta funcionalidad se completará en la próxima actualización.",
        });
      }

      const url = caseData ? `/api/cases/${caseData.id}` : "/api/cases";
      const method = caseData ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar el caso");
      }

      toast({
        title: caseData
          ? "Caso actualizado exitosamente"
          : "Caso creado exitosamente",
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title:
          error instanceof Error ? error.message : "Error al guardar el caso",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {caseData ? "Editar Caso" : "Reportar Nuevo Caso"}
          </DialogTitle>
          <DialogDescription>
            {caseData
              ? "Actualiza la información del caso"
              : "Completa los datos del reporte de violencia"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Incident Details */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Detalles del Incidente</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Incident Date */}
              <div className="space-y-2">
                <Label htmlFor="incidentDate">
                  Fecha del Incidente <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="incidentDate"
                  type="date"
                  value={formData.incidentDate}
                  onChange={(e) =>
                    setFormData({ ...formData, incidentDate: e.target.value })
                  }
                  required
                  disabled={loading}
                  max={new Date().toISOString().split("T")[0]}
                />
              </div>

              {/* Incident Time */}
              <div className="space-y-2">
                <Label htmlFor="incidentTime">
                  Hora del Incidente <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="incidentTime"
                  type="time"
                  value={formData.incidentTime}
                  onChange={(e) =>
                    setFormData({ ...formData, incidentTime: e.target.value })
                  }
                  required
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Violence Type */}
              <div className="space-y-2">
                <Label htmlFor="violenceType">
                  Tipo de Violencia <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.violenceType}
                  onValueChange={(value: ViolenceType) =>
                    setFormData({ ...formData, violenceType: value })
                  }
                  disabled={loading}
                >
                  <SelectTrigger id="violenceType">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(ViolenceType).map((type) => (
                      <SelectItem key={type} value={type}>
                        {translateViolenceType(type)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">
                  Prioridad <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: CasePriority) =>
                    setFormData({ ...formData, priority: value })
                  }
                  disabled={loading}
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(CasePriority).map((priority) => (
                      <SelectItem key={priority} value={priority}>
                        {translateCasePriority(priority)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Descripción del Incidente{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Describe lo que sucedió de manera detallada..."
                required
                disabled={loading}
                rows={4}
                minLength={10}
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 10 caracteres
              </p>
            </div>

            {/* Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">
                  Ubicación <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.location}
                  onValueChange={(value) =>
                    setFormData({ ...formData, location: value })
                  }
                  disabled={loading}
                >
                  <SelectTrigger id="location">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {formData.location === "OTHER" && (
                <div className="space-y-2">
                  <Label htmlFor="customLocation">
                    Especificar Ubicación{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="customLocation"
                    value={formData.customLocation}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        customLocation: e.target.value,
                      })
                    }
                    placeholder="Especifica dónde ocurrió"
                    required
                    disabled={loading}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Victim Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información de la Víctima</h3>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="victimIsAnonymous"
                checked={formData.victimIsAnonymous}
                onCheckedChange={(checked) =>
                  setFormData({
                    ...formData,
                    victimIsAnonymous: checked as boolean,
                  })
                }
                disabled={loading}
              />
              <Label
                htmlFor="victimIsAnonymous"
                className="text-sm font-normal cursor-pointer"
              >
                Mantener víctima anónima
              </Label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="victimName">
                  Nombre de la Víctima <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="victimName"
                  value={formData.victimName}
                  onChange={(e) =>
                    setFormData({ ...formData, victimName: e.target.value })
                  }
                  placeholder={
                    formData.victimIsAnonymous ? "Anónimo" : "Nombre completo"
                  }
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="victimAge">Edad</Label>
                <Input
                  id="victimAge"
                  type="number"
                  min="1"
                  max="100"
                  value={formData.victimAge}
                  onChange={(e) =>
                    setFormData({ ...formData, victimAge: e.target.value })
                  }
                  placeholder="Edad"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="victimGrade">Grado/Curso</Label>
                <Input
                  id="victimGrade"
                  value={formData.victimGrade}
                  onChange={(e) =>
                    setFormData({ ...formData, victimGrade: e.target.value })
                  }
                  placeholder="Ej: 5to Básico"
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          {/* Aggressor Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Información del Agresor</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aggressorName">
                  Nombre del Agresor <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="aggressorName"
                  value={formData.aggressorName}
                  onChange={(e) =>
                    setFormData({ ...formData, aggressorName: e.target.value })
                  }
                  placeholder="Nombre o descripción del agresor"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="relationshipToVictim">
                  Relación con la Víctima
                </Label>
                <Input
                  id="relationshipToVictim"
                  value={formData.relationshipToVictim}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      relationshipToVictim: e.target.value,
                    })
                  }
                  placeholder="Ej: Compañero de clase, Desconocido"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aggressorDescription">
                Descripción del Agresor
              </Label>
              <Textarea
                id="aggressorDescription"
                value={formData.aggressorDescription}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    aggressorDescription: e.target.value,
                  })
                }
                placeholder="Características físicas, vestimenta, comportamiento..."
                disabled={loading}
                rows={3}
              />
            </div>
          </div>

          {/* Witnesses and Evidence */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Testigos y Evidencia</h3>

            <div className="space-y-2">
              <Label htmlFor="witnesses">Testigos</Label>
              <Textarea
                id="witnesses"
                value={formData.witnesses}
                onChange={(e) =>
                  setFormData({ ...formData, witnesses: e.target.value })
                }
                placeholder="Nombres de testigos y sus declaraciones..."
                disabled={loading}
                rows={3}
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Archivos de Evidencia</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <p className="text-sm text-gray-600 text-center">
                    Arrastra archivos aquí o haz clic para seleccionar
                  </p>
                  <p className="text-xs text-gray-500 text-center">
                    Imágenes, PDF, Audio, Video (máx. 10MB cada uno)
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,audio/*,video/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                    disabled={loading}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      document.getElementById("file-upload")?.click()
                    }
                    disabled={loading}
                  >
                    Seleccionar Archivos
                  </Button>
                </div>

                {/* Selected files (not yet uploaded) */}
                {selectedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">
                      Archivos seleccionados:
                    </p>
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <span>{getFileIcon(file.type)}</span>
                          <span className="text-sm">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            ({formatFileSize(file.size)})
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSelectedFile(index)}
                          disabled={loading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Uploaded files */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">Archivos subidos:</p>
                    {uploadedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-green-50 rounded"
                      >
                        <div className="flex items-center gap-2">
                          <span>{getFileIcon(file.type)}</span>
                          <a
                            href={file.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {file.name}
                          </a>
                          <span className="text-xs text-gray-500">
                            ({formatFileSize(file.size)})
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUploadedFile(index)}
                          disabled={loading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Status (only for editing) */}
          {caseData && (
            <div className="space-y-2">
              <Label htmlFor="status">
                Estado del Caso <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.status}
                onValueChange={(value: CaseStatus) =>
                  setFormData({ ...formData, status: value })
                }
                disabled={loading}
              >
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CaseStatus).map((status) => (
                    <SelectItem key={status} value={status}>
                      {translateCaseStatus(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {caseData ? "Actualizar" : "Crear"} Caso
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
