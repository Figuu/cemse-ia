"use client";

import { useState, useEffect } from "react";
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
import { Upload, X, FileIcon, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { LibraryVisibility } from "@prisma/client";

interface LibraryUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  userRole: string;
}

export function LibraryUploadModal({
  open,
  onOpenChange,
  onSuccess,
  userRole,
}: LibraryUploadModalProps) {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<LibraryVisibility>("PRIVATE");

  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";
  const isDirector = userRole === "DIRECTOR";

  useEffect(() => {
    if (!open) {
      // Reset form when modal closes
      setFile(null);
      setTitle("");
      setDescription("");
      setVisibility("PRIVATE");
    }
  }, [open]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (selectedFile.size > maxSize) {
      toast({
        title: "Archivo demasiado grande",
        description: "El archivo no debe exceder 50MB",
        variant: "destructive",
      });
      return;
    }

    setFile(selectedFile);
    // Auto-fill title if empty
    if (!title) {
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!file || !title.trim()) {
      toast({
        title: "Campos requeridos",
        description: "Título y archivo son obligatorios",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("title", title.trim());
      if (description.trim()) {
        formData.append("description", description.trim());
      }
      formData.append("visibility", visibility);

      const response = await fetch("/api/library", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al subir el archivo");
      }

      toast({
        title: "Archivo subido exitosamente",
        description: isDirector && visibility === "PUBLIC"
          ? "El archivo público está pendiente de aprobación por un administrador"
          : "El archivo ha sido agregado a la biblioteca",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al subir el archivo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Subir Archivo a la Biblioteca</DialogTitle>
          <DialogDescription>
            Comparte recursos educativos con los profesores del sistema
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">Archivo *</Label>
              {!file ? (
                <div className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-muted/50 transition-colors">
                  <input
                    type="file"
                    id="file"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="*/*"
                  />
                  <label
                    htmlFor="file"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <Upload className="h-10 w-10 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      Haz clic para seleccionar un archivo
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Máximo 50MB
                    </span>
                  </label>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                  <FileIcon className="h-8 w-8 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} • {file.type}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => setFile(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Título *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nombre del recurso"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe el contenido del archivo (opcional)"
                rows={3}
              />
            </div>

            {/* Visibility */}
            <div className="space-y-2">
              <Label htmlFor="visibility">Visibilidad</Label>
              <Select value={visibility} onValueChange={(value) => setVisibility(value as LibraryVisibility)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {isAdmin ? (
                    <>
                      <SelectItem value="PUBLIC">Público (visible para todos)</SelectItem>
                      <SelectItem value="PRIVATE">Privado (solo para el colegio)</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="PUBLIC">
                        Público (visible para todos - requiere aprobación)
                      </SelectItem>
                      <SelectItem value="PRIVATE">
                        Privado (solo profesores del colegio)
                      </SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
              {isDirector && visibility === "PUBLIC" && (
                <p className="text-xs text-muted-foreground">
                  Los archivos públicos necesitan aprobación de un administrador antes de ser visibles para todos
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !file || !title.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Subir Archivo
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

