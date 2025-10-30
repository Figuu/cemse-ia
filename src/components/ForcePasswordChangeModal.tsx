"use client";

import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Lock } from "lucide-react";

interface ForcePasswordChangeModalProps {
  open: boolean;
}

export function ForcePasswordChangeModal({
  open,
}: ForcePasswordChangeModalProps) {
  const router = useRouter();

  const handleRedirect = () => {
    router.push("/change-password?firstLogin=true");
  };

  return (
    <Dialog open={open}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900/20">
            <Shield className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
          </div>
          <DialogTitle>Cambio de Contraseña Requerido</DialogTitle>
          <DialogDescription className="pt-2 text-center">
            Por razones de seguridad, debes cambiar tu contraseña antes de
            continuar usando la plataforma.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center gap-3 rounded-md bg-muted p-3">
            <Lock className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm">
              Tu contraseña actual fue asignada temporalmente y debe ser
              reemplazada por una que elijas.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleRedirect} className="w-full">
            Cambiar Contraseña Ahora
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
