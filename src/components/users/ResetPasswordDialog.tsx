"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Key, Copy } from "lucide-react";

interface ResetPasswordDialogProps {
  userId: string;
  userName: string;
  onSuccess?: () => void;
}

export function ResetPasswordDialog({
  userId,
  userName,
  onSuccess,
}: ResetPasswordDialogProps) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);

  const handleReset = async () => {
    setLoading(true);

    try {
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        setNewPassword(data.newPassword);
        toast({
          title: "Contraseña restablecida",
          description: "Se ha generado una nueva contraseña para el usuario",
        });
      } else {
        toast({
          title: "Error",
          description: data.error || "Error al restablecer la contraseña",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Reset password error:", error);
      toast({
        title: "Error",
        description: "Error al restablecer la contraseña",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = () => {
    if (newPassword) {
      navigator.clipboard.writeText(newPassword);
      toast({
        title: "Contraseña copiada",
        description: "La contraseña se ha copiado al portapapeles",
      });
    }
  };

  const handleClose = () => {
    setOpen(false);
    setNewPassword(null);
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" aria-label="Restablecer contraseña">
          <Key className="mr-2 h-4 w-4" aria-hidden="true" />
          Restablecer Contraseña
        </Button>
      </DialogTrigger>
      <DialogContent role="dialog" aria-labelledby="dialog-title">
        <DialogHeader>
          <DialogTitle id="dialog-title">Restablecer Contraseña</DialogTitle>
          <DialogDescription>
            {newPassword
              ? "La contraseña ha sido restablecida exitosamente."
              : `¿Estás seguro de que deseas restablecer la contraseña de ${userName}? Se generará una nueva contraseña temporal que deberás compartir con el usuario.`}
          </DialogDescription>
        </DialogHeader>

        {newPassword ? (
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted p-4">
              <p className="mb-2 text-sm font-medium">Nueva Contraseña:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-background px-3 py-2 font-mono text-sm">
                  {newPassword}
                </code>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyPassword}
                  aria-label="Copiar contraseña al portapapeles"
                >
                  <Copy className="h-4 w-4" aria-hidden="true" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Guarda esta contraseña de forma segura. El usuario necesitará
              cambiarla al iniciar sesión.
            </p>
          </div>
        ) : (
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              Esta acción generará una nueva contraseña automáticamente y
              requerirá que el usuario la cambie al iniciar sesión.
            </p>
          </div>
        )}

        <DialogFooter>
          {newPassword ? (
            <Button onClick={handleClose}>Cerrar</Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleReset}
                disabled={loading}
              >
                {loading ? "Restableciendo..." : "Restablecer Contraseña"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
