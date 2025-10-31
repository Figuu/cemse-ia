"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  User,
  Mail,
  Phone,
  Building,
  FileText,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface UserDashboardProps {
  profile: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    department: string | null;
    pfpUrl: string | null;
    biography: string | null;
    role: string;
    forcePasswordChange: boolean;
  };
}

export function UserDashboard({ profile }: UserDashboardProps) {
  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Calculate profile completeness
  const profileFields = [
    { field: "name", value: profile.name, required: true },
    { field: "email", value: profile.email, required: true },
    { field: "phone", value: profile.phone, required: false },
    { field: "department", value: profile.department, required: false },
    { field: "biography", value: profile.biography, required: false },
  ];

  // Helper function to check if a field is filled
  const isFieldFilled = (value: string | null | undefined): boolean => {
    if (!value) return false;
    return typeof value === "string" && value.trim() !== "";
  };

  const requiredFields = profileFields.filter(f => f.required);
  const optionalFields = profileFields.filter(f => !f.required);

  const completedRequiredFields = requiredFields.filter(f => isFieldFilled(f.value)).length;
  const allRequiredFieldsCompleted = completedRequiredFields === requiredFields.length;

  const completedFields = profileFields.filter(f => isFieldFilled(f.value)).length;
  const totalFields = profileFields.length;
  const profileCompleteness = Math.round((completedFields / totalFields) * 100);

  // Only show missing fields if required fields are complete, otherwise show required missing fields
  const missingFields = allRequiredFieldsCompleted
    ? optionalFields.filter(f => !isFieldFilled(f.value)).map(f => f.field)
    : requiredFields.filter(f => !isFieldFilled(f.value)).map(f => f.field);

  // Don't show the completeness card if all required fields are complete and no optional fields are missing
  const shouldShowCompletenessCard = !allRequiredFieldsCompleted || missingFields.length > 0;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-lg border bg-gradient-to-r from-primary/10 to-primary/5 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">
              Bienvenido de nuevo, {profile.name}!
            </h2>
            <p className="mt-1 text-muted-foreground">
              Aquí tienes un resumen de tu cuenta y acciones rápidas
            </p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
            {getInitials(profile.name)}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Completeness Card */}
        {shouldShowCompletenessCard && (
          <Card>
            <CardHeader>
              <CardTitle>Completitud del Perfil</CardTitle>
              <CardDescription>
                {allRequiredFieldsCompleted
                  ? "Completa información adicional para mejorar tu perfil"
                  : "Completa los campos requeridos para continuar"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progreso</span>
                  <span className="font-semibold">{profileCompleteness}%</span>
                </div>
                <Progress value={profileCompleteness} className="h-2" />
              </div>

              {missingFields.length > 0 && (
                <div className="rounded-lg border bg-muted p-3">
                  <p className="mb-2 text-sm font-medium">Campos pendientes:</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {missingFields.map(field => (
                      <li key={field} className="flex items-center gap-2">
                        <ChevronRight className="h-3 w-3" />
                        <span className="capitalize">
                          {field === "name"
                            ? "Nombre"
                            : field === "email"
                              ? "Email"
                              : field === "phone"
                                ? "Teléfono"
                                : field === "department"
                                  ? "Departamento"
                                  : field === "biography"
                                    ? "Biografía"
                                    : field}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Button asChild className="w-full">
                <Link href="/profile">
                  {allRequiredFieldsCompleted
                    ? "Agregar Información"
                    : "Completar Perfil"}
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions Card */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>
              Accede rápidamente a las funciones más usadas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              asChild
              variant="outline"
              className="w-full justify-between"
            >
              <Link href="/profile">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Ver mi perfil
                </div>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              className="w-full justify-between"
            >
              <Link href="/profile">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Editar información
                </div>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>

            {profile.forcePasswordChange && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
                <p className="text-sm font-medium text-destructive">
                  Debes cambiar tu contraseña
                </p>
                <p className="mt-1 text-xs text-destructive/80">
                  Por favor, cambia tu contraseña por seguridad.
                </p>
                <Button
                  asChild
                  variant="destructive"
                  size="sm"
                  className="mt-2 w-full"
                >
                  <Link href="/profile">Cambiar Contraseña</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Profile Summary Card */}
        <Card>
          <CardHeader>
            <CardTitle>Resumen del Perfil</CardTitle>
            <CardDescription>Tu información básica</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">{profile.name}</p>
                <p className="text-xs text-muted-foreground">Nombre completo</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <p className="text-sm font-medium">{profile.email}</p>
                <p className="text-xs text-muted-foreground">
                  Correo electrónico
                </p>
              </div>
            </div>

            {profile.phone && (
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{profile.phone}</p>
                  <p className="text-xs text-muted-foreground">Teléfono</p>
                </div>
              </div>
            )}

            {profile.department && (
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{profile.department}</p>
                  <p className="text-xs text-muted-foreground">Departamento</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de la Cuenta</CardTitle>
            <CardDescription>Información sobre tu cuenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Estado de la cuenta</span>
                <Badge variant="secondary">Activa</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Cambio de contraseña</span>
                <Badge
                  variant={
                    profile.forcePasswordChange ? "destructive" : "secondary"
                  }
                >
                  {profile.forcePasswordChange ? "Requerido" : "Opcional"}
                </Badge>
              </div>
            </div>

            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm font-medium">
                Tu cuenta está activa y funcionando correctamente
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Si tienes problemas, contacta al administrador del sistema.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
