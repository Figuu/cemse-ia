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
import { Edit, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { LibraryVisibility } from "@prisma/client";

interface LibraryItem {
  id: string;
  title: string;
  description: string | null;
  visibility: LibraryVisibility;
}

interface LibraryEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: LibraryItem | null;
  onSuccess: () => void;
  userRole: string;
}

export function LibraryEditModal({
  open,
  onOpenChange,
  item,
  onSuccess,
  userRole,
}: LibraryEditModalProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState<LibraryVisibility>("PRIVATE");

  const isAdmin = userRole === "ADMIN" || userRole === "SUPER_ADMIN";

  useEffect(() => {
    if (item) {
      setTitle(item.title);
      setDescription(item.description || "");
      setVisibility(item.visibility);
    }
  }, [item, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!item || !title.trim()) {
      toast({
        title: "Campos requeridos",
        description: "El título es obligatorio",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/library/${item.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
          visibility,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar el archivo");
      }

      toast({
        title: "Archivo actualizado exitosamente",
        description: !isAdmin && visibility === "PUBLIC"
          ? "El cambio a público requiere aprobación de un administrador"
          : "Los cambios han sido guardados",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al actualizar el archivo",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Editar Archivo</DialogTitle>
          <DialogDescription>
            Actualiza la información del archivo en la biblioteca
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
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
              {!isAdmin && visibility === "PUBLIC" && item.visibility === "PRIVATE" && (
                <p className="text-xs text-muted-foreground">
                  Al cambiar a público, el archivo necesitará aprobación de un administrador
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading || !title.trim()}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Edit className="mr-2 h-4 w-4" />
                  Guardar Cambios
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

