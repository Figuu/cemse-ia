"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
  id: string;
  authUserId: string;
  email: string;
  name: string;
  phone: string | null;
  department: string | null;
  biography: string | null;
  pfpUrl: string | null;
  role: string;
  forcePasswordChange: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export default function UserDetailPage() {
  const { profile } = useAuth();
  const router = useRouter();
  const params = useParams();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    department: "",
    biography: "",
    role: "USER" as "USER" | "ADMIN" | "SUPER_ADMIN",
    forcePasswordChange: false,
  });

  const userId = params.id as string;

  // Redirect if not admin
  useEffect(() => {
    if (profile && profile.role !== "ADMIN" && profile.role !== "SUPER_ADMIN") {
      router.push("/dashboard");
    }
  }, [profile, router]);

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
      if (
        !profile ||
        (profile.role !== "ADMIN" && profile.role !== "SUPER_ADMIN")
      ) {
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`/api/users/${userId}`);
        const data = await response.json();

        if (response.ok) {
          setUser(data.user);
          setFormData({
            name: data.user.name,
            phone: data.user.phone || "",
            department: data.user.department || "",
            biography: data.user.biography || "",
            role: data.user.role,
            forcePasswordChange: data.user.forcePasswordChange,
          });
        } else {
          toast({
            title: "Error",
            description: data.error || "Error al obtener el usuario",
            variant: "destructive",
          });
          router.push("/users");
        }
      } catch (error) {
        console.error("Fetch user error:", error);
        toast({
          title: "Error",
          description: "Error al obtener el usuario",
          variant: "destructive",
        });
        router.push("/users");
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId, profile, router, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          phone: formData.phone || null,
          department: formData.department || null,
          biography: formData.biography || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Usuario actualizado",
          description: "El usuario se ha actualizado exitosamente",
        });
        // Refresh user data
        const refreshResponse = await fetch(`/api/users/${userId}`);
        const refreshData = await refreshResponse.json();
        if (refreshResponse.ok) {
          setUser(refreshData.user);
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Error al actualizar el usuario",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Update user error:", error);
      toast({
        title: "Error",
        description: "Error al actualizar el usuario",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    setSaving(true);

    try {
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: "POST",
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Contraseña restablecida",
          description: `Nueva contraseña: ${data.newPassword}`,
        });
        setShowPasswordReset(false);
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
      setSaving(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (
    !profile ||
    (profile.role !== "ADMIN" && profile.role !== "SUPER_ADMIN")
  ) {
    return null;
  }

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <p className="text-center">Cargando usuario...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const canChangeRole = profile.role === "SUPER_ADMIN";

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.pfpUrl || undefined} />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Editar Usuario</CardTitle>
          <CardDescription>
            Actualiza la información del usuario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre Completo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Juan Pérez"
                value={formData.name}
                onChange={e =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="1234567890"
                value={formData.phone}
                onChange={e =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Input
                id="department"
                type="text"
                placeholder="Recursos Humanos"
                value={formData.department}
                onChange={e =>
                  setFormData({ ...formData, department: e.target.value })
                }
              />
            </div>

            {canChangeRole && (
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select
                  value={formData.role}
                  onValueChange={value =>
                    setFormData({
                      ...formData,
                      role: value as typeof formData.role,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USER">Usuario</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="forcePasswordChange"
                checked={formData.forcePasswordChange}
                onChange={e =>
                  setFormData({
                    ...formData,
                    forcePasswordChange: e.target.checked,
                  })
                }
                className="h-4 w-4"
              />
              <Label
                htmlFor="forcePasswordChange"
                className="text-sm font-normal"
              >
                Requerir cambio de contraseña al iniciar sesión
              </Label>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Restablecer Contraseña
          </CardTitle>
          <CardDescription>
            Genera una nueva contraseña para este usuario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => setShowPasswordReset(!showPasswordReset)}
            className="mb-4"
          >
            {showPasswordReset ? "Cancelar" : "Restablecer Contraseña"}
          </Button>

          {showPasswordReset && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                ¿Estás seguro de que deseas restablecer la contraseña de este
                usuario? Se generará una nueva contraseña temporal.
              </p>
              <Button
                variant="destructive"
                onClick={handlePasswordReset}
                disabled={saving}
              >
                {saving ? "Restableciendo..." : "Confirmar Restablecimiento"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
