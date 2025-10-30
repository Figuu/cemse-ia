import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface UploadProgress {
  percentage: number;
  uploading: boolean;
}

interface UseFileUploadReturn {
  uploadFile: (file: File) => Promise<string | null>;
  deleteFile: () => Promise<boolean>;
  progress: UploadProgress;
}

export function useFileUpload(): UseFileUploadReturn {
  const { toast } = useToast();
  const [progress, setProgress] = useState<UploadProgress>({
    percentage: 0,
    uploading: false,
  });

  const uploadFile = async (file: File): Promise<string | null> => {
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
      return null;
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      toast({
        title: "Archivo demasiado grande",
        description: "El archivo no debe exceder 5MB",
        variant: "destructive",
      });
      return null;
    }

    setProgress({ percentage: 0, uploading: true });

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al subir el archivo");
      }

      setProgress({ percentage: 100, uploading: false });

      toast({
        title: "Archivo subido",
        description: "Tu foto de perfil se ha actualizado correctamente",
      });

      return data.file.url;
    } catch (error) {
      setProgress({ percentage: 0, uploading: false });

      toast({
        title: "Error al subir archivo",
        description:
          error instanceof Error ? error.message : "Ocurrió un error",
        variant: "destructive",
      });

      return null;
    }
  };

  const deleteFile = async (): Promise<boolean> => {
    try {
      const response = await fetch("/api/files/delete", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar el archivo");
      }

      toast({
        title: "Archivo eliminado",
        description: "Tu foto de perfil ha sido eliminada",
      });

      return true;
    } catch {
      toast({
        title: "Error",
        description: "No se pudo eliminar el archivo",
        variant: "destructive",
      });

      return false;
    }
  };

  return {
    uploadFile,
    deleteFile,
    progress,
  };
}
