"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, Building, FileText, User, Pencil, Save, X, Loader2, School as SchoolIcon } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { translateRole, getRoleBadgeColor, translateSchoolType } from "@/lib/translations";

export default function ProfilePage() {
  const { profile, refreshUser } = useAuth();
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    department: "",
    biography: "",
  });

  useEffect(() => {
    if (!profile) {
      router.push("/sign-in");
      return;
    }

    setFormData({
      name: profile.name || "",
      phone: profile.phone || "",
      department: profile.department || "",
      biography: profile.biography || "",
    });
  }, [profile, router]);

  // Scroll to change password section when hash is present
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#change-password") {
      const element = document.getElementById("change-password");
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: "smooth", block: "start" });
          // Focus the button to highlight it
          const button = element.querySelector("button");
          if (button) {
            button.focus();
          }
        }, 100);
      }
    }
  }, []);

  const getInitials = (name: string) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar el perfil");
      }

      toast({
        title: "Perfil actualizado exitosamente",
      });
      await refreshUser();
      setEditing(false);
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Error al actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!profile) return;
    setFormData({
      name: profile.name || "",
      phone: profile.phone || "",
      department: profile.department || "",
      biography: profile.biography || "",
    });
    setEditing(false);
  };

  if (!profile) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Mi Perfil</h2>
          <p className="text-muted-foreground">
            Administra tu información personal
          </p>
        </div>
        {!editing && (
          <Button onClick={() => setEditing(true)} className="gap-2">
            <Pencil className="h-4 w-4" />
            <span className="hidden sm:inline">Editar Perfil</span>
          </Button>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Información Personal</CardTitle>
              <Badge className={getRoleBadgeColor(profile.role)}>
                {translateRole(profile.role)}
              </Badge>
            </div>
            <CardDescription>Detalles de tu cuenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <Avatar className="h-20 w-20">
                <AvatarImage src={profile.pfpUrl || undefined} />
                <AvatarFallback className="text-lg">
                  {getInitials(profile.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-lg font-semibold">{profile.name}</h3>
                <p className="text-sm text-muted-foreground">{profile.email}</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              {editing ? (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="Tu nombre completo"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      placeholder="+51 999 999 999"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="department">Departamento</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) =>
                        setFormData({ ...formData, department: e.target.value })
                      }
                      placeholder="Tu departamento"
                      disabled={loading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="biography">Biografía</Label>
                    <Textarea
                      id="biography"
                      value={formData.biography}
                      onChange={(e) =>
                        setFormData({ ...formData, biography: e.target.value })
                      }
                      placeholder="Cuéntanos sobre ti..."
                      rows={4}
                      disabled={loading}
                      maxLength={500}
                    />
                    <p className="text-xs text-muted-foreground">
                      {formData.biography.length}/500 caracteres
                    </p>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-1"
                    >
                      {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      <Save className="mr-2 h-4 w-4" />
                      Guardar
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleCancel}
                      disabled={loading}
                      className="flex-1"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Cancelar
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nombre</p>
                      <p className="text-sm text-muted-foreground">
                        {profile.name || "No especificado"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        {profile.email}
                      </p>
                    </div>
                  </div>

                  {profile.phone && (
                    <div className="flex items-start gap-3">
                      <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Teléfono</p>
                        <p className="text-sm text-muted-foreground">
                          {profile.phone}
                        </p>
                      </div>
                    </div>
                  )}

                  {profile.department && (
                    <div className="flex items-start gap-3">
                      <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Departamento</p>
                        <p className="text-sm text-muted-foreground">
                          {profile.department}
                        </p>
                      </div>
                    </div>
                  )}

                  {profile.biography && (
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Biografía</p>
                        <p className="text-sm text-muted-foreground">
                          {profile.biography}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* School Information Card */}
        {profile.school && (
          <Card>
            <CardHeader>
              <CardTitle>Información del Colegio</CardTitle>
              <CardDescription>Tu colegio asignado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <SchoolIcon className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{profile.school.name}</h3>
                  <Badge className="mt-1">
                    {translateSchoolType(profile.school.type)}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Código</p>
                  <p className="text-sm text-muted-foreground">
                    <code className="bg-muted px-2 py-1 rounded">
                      {profile.school.code}
                    </code>
                  </p>
                </div>

                {profile.school.address && (
                  <div>
                    <p className="text-sm font-medium">Dirección</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.school.address}
                    </p>
                  </div>
                )}

                {profile.school.district && (
                  <div>
                    <p className="text-sm font-medium">Distrito</p>
                    <p className="text-sm text-muted-foreground">
                      {profile.school.district}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Account Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de la Cuenta</CardTitle>
            <CardDescription>Información sobre tu cuenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Estado</span>
                <Badge variant="secondary">Activa</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm">Rol</span>
                <Badge className={getRoleBadgeColor(profile.role)}>
                  {translateRole(profile.role)}
                </Badge>
              </div>

              {profile.forcePasswordChange && (
                <div className="flex items-center justify-between">
                  <span className="text-sm">Cambio de contraseña</span>
                  <Badge variant="destructive">Requerido</Badge>
                </div>
              )}
            </div>

            <Separator />

            <div className="rounded-lg bg-muted p-3">
              <p className="text-sm font-medium">
                Tu cuenta está activa y funcionando correctamente
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Si tienes problemas, contacta al administrador del sistema.
              </p>
            </div>

            <Button
              id="change-password"
              variant="outline"
              className="w-full"
              onClick={() => router.push("/change-password")}
            >
              Cambiar Contraseña
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
