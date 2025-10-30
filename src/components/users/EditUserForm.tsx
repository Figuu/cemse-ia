"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save } from "lucide-react";

interface User {
  id: string;
  authUserId: string;
  email: string;
  name: string;
  phone: string | null;
  department: string | null;
  biography: string | null;
  role: string;
  forcePasswordChange: boolean;
}

interface EditUserFormProps {
  userId: string;
  onSuccess?: () => void;
}

export function EditUserForm({ userId, onSuccess }: EditUserFormProps) {
  const { profile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    department: "",
    biography: "",
    role: "USER" as "USER" | "ADMIN" | "SUPER_ADMIN",
    forcePasswordChange: false,
  });

  // Fetch user data
  useEffect(() => {
    const fetchUser = async () => {
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
        }
      } catch (error) {
        console.error("Fetch user error:", error);
        toast({
          title: "Error",
          description: "Error al obtener el usuario",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId, toast]);

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

        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/users");
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

  const canChangeRole = profile?.role === "SUPER_ADMIN";

  if (loading) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Cargando usuario...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">Usuario no encontrado</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Correo Electrónico</Label>
        <Input id="email" type="email" value={user.email} disabled />
        <p className="text-xs text-muted-foreground">
          El correo electrónico no se puede modificar
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">
          Nombre Completo <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Juan Pérez"
          value={formData.name}
          onChange={e => setFormData({ ...formData, name: e.target.value })}
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
          onChange={e => setFormData({ ...formData, phone: e.target.value })}
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

      <div className="space-y-2">
        <Label htmlFor="biography">Biografía</Label>
        <Textarea
          id="biography"
          placeholder="Información adicional sobre el usuario..."
          value={formData.biography}
          onChange={e =>
            setFormData({ ...formData, biography: e.target.value })
          }
          rows={4}
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
        <Label htmlFor="forcePasswordChange" className="text-sm font-normal">
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
  );
}

