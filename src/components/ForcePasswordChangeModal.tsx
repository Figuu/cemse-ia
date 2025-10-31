"use client";

import React from "react";
import { useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shield, Lock, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ForcePasswordChangeModalProps {
  open: boolean;
}

const BlurredOverlay = ({ className, ...props }: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>) => (
  <DialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-50 bg-background/10 backdrop-blur-[2px] data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props}
  />
);

const BlurredDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <BlurredOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
BlurredDialogContent.displayName = DialogPrimitive.Content.displayName;

export function ForcePasswordChangeModal({
  open,
}: ForcePasswordChangeModalProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = React.useState(open);

  React.useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleRedirect = () => {
    router.push("/profile#change-password");
  };

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
      <BlurredDialogContent className="sm:max-w-[425px]">
        <DialogPrimitive.Close 
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
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
      </BlurredDialogContent>
    </DialogPrimitive.Root>
  );
}
