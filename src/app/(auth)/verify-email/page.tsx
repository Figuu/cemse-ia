"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import {
  CheckCircle2,
  XCircle,
  Mail,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    const token = searchParams.get("token");
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Token de verificación no válido");
        return;
      }

      setIsVerifying(true);

      try {
        const response = await fetch("/api/auth/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!response.ok) {
          setStatus("error");
          setMessage(data.error || "Error al verificar el correo electrónico");
          return;
        }

        setStatus("success");
        setMessage("Tu correo electrónico ha sido verificado exitosamente");
      } catch {
        setStatus("error");
        setMessage("Error al verificar el correo electrónico");
      } finally {
        setIsVerifying(false);
      }
    };

    verifyEmail();
  }, [searchParams]);

  const handleResendEmail = async () => {
    setIsVerifying(true);
    // TODO: Implement resend email functionality
    setTimeout(() => {
      setIsVerifying(false);
      setMessage("Correo de verificación reenviado");
    }, 1000);
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="text-2xl font-bold">
          Verificación de Correo Electrónico
        </CardTitle>
        <CardDescription>Verificando tu correo electrónico...</CardDescription>
      </CardHeader>
      <CardContent>
        {status === "loading" && isVerifying && (
          <div className="space-y-6 py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                Verificando tu correo electrónico
              </h3>
              <p className="text-sm text-muted-foreground">
                Por favor espera mientras verificamos tu correo...
              </p>
            </div>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6 py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                ¡Correo verificado exitosamente!
              </h3>
              <p className="text-sm text-muted-foreground">
                Tu cuenta ha sido verificada correctamente. Ya puedes iniciar
                sesión.
              </p>
            </div>
            <Link href="/sign-in">
              <Button className="w-full">
                Ir al inicio de sesión
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6 py-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">
                Error en la verificación
              </h3>
              <p className="text-sm text-muted-foreground">{message}</p>
            </div>
            <div className="space-y-3">
              <Button
                onClick={handleResendEmail}
                variant="outline"
                className="w-full"
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Reenviar correo de verificación
                  </>
                )}
              </Button>
              <Link href="/sign-in">
                <Button variant="outline" className="w-full">
                  Volver al inicio de sesión
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      }
    >
      <VerifyEmailForm />
    </Suspense>
  );
}
