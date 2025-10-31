"use client";

import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { X, Loader2, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProfilePictureUploadProps {
  currentImageUrl?: string | null;
  userName: string;
  onUploadComplete?: (imageUrl: string) => void;
  onDelete?: () => void;
}

export default function ProfilePictureUpload({
  currentImageUrl,
  userName,
  onUploadComplete,
  onDelete,
}: ProfilePictureUploadProps) {
  const { toast } = useToast();
  const [preview, setPreview] = useState<string | null>(
    currentImageUrl || null
  );
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Tipo de archivo no válido",
        description:
          "Solo se permiten archivos de imagen (JPG, PNG, GIF, WEBP)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Archivo demasiado grande",
        description: "El archivo no debe exceder 5MB",
        variant: "destructive",
      });
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al subir la imagen");
      }

      setUploadProgress(100);

      toast({
        title: "Imagen actualizada",
        description: "Tu foto de perfil se ha actualizado correctamente",
      });

      if (onUploadComplete) {
        onUploadComplete(data.file.url);
      }

      setTimeout(() => {
        setUploadProgress(0);
        setUploading(false);
      }, 1000);
    } catch (error) {
      setPreview(currentImageUrl || null);
      setUploading(false);
      setUploadProgress(0);

      toast({
        title: "Error al subir imagen",
        description:
          error instanceof Error ? error.message : "Ocurrió un error",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch("/api/files/delete", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la imagen");
      }

      setPreview(null);

      toast({
        title: "Imagen eliminada",
        description: "Tu foto de perfil ha sido eliminada",
      });

      if (onDelete) {
        onDelete();
      }
    } catch {
      toast({
        title: "Error",
        description: "No se pudo eliminar la imagen",
        variant: "destructive",
      });
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Foto de Perfil</CardTitle>
        <CardDescription>
          Sube una foto para personalizar tu perfil
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-32 w-32">
            <AvatarImage src={preview || undefined} />
            <AvatarFallback className="text-2xl">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>

          {uploading && (
            <div className="w-full max-w-xs">
              <div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
                <span>Subiendo...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              type="button"
              onClick={handleButtonClick}
              disabled={uploading}
              variant="outline"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Elegir foto
                </>
              )}
            </Button>

            {preview && (
              <Button
                type="button"
                onClick={handleDelete}
                disabled={uploading}
                variant="destructive"
              >
                <X className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            )}
          </div>

          <p className="text-center text-xs text-muted-foreground">
            Formatos permitidos: JPG, PNG, GIF, WEBP. Tamaño máximo: 5MB
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
