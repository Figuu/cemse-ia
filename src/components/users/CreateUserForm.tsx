"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
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
import { Save } from "lucide-react";

interface CreateUserFormProps {
  onSuccess?: () => void;
}

export function CreateUserForm({ onSuccess }: CreateUserFormProps) {
  const { profile } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    phone: "",
    department: "",
    role: "USER" as "USER" | "ADMIN" | "SUPER_ADMIN",
    forcePasswordChange: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          phone: formData.phone || undefined,
          department: formData.department || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Usuario creado",
          description: `Usuario creado exitosamente. Contraseña temporal: ${data.temporaryPassword}`,
        });

        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/users");
        }
      } else {
        toast({
          title: "Error",
          description: data.error || "Error al crear el usuario",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Create user error:", error);
      toast({
        title: "Error",
        description: "Error al crear el usuario",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const canCreateAdminRole = profile?.role === "SUPER_ADMIN";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">
          Correo Electrónico <span className="text-destructive">*</span>
        </Label>
        <Input
          id="email"
          type="email"
          placeholder="usuario@ejemplo.com"
          value={formData.email}
          onChange={e => setFormData({ ...formData, email: e.target.value })}
          required
        />
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
        <Label htmlFor="role">
          Rol <span className="text-destructive">*</span>
        </Label>
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
            <SelectItem
              value="USER"
              disabled={!canCreateAdminRole && formData.role !== "USER"}
            >
              Usuario
            </SelectItem>
            {canCreateAdminRole && <SelectItem value="ADMIN">Admin</SelectItem>}
            {canCreateAdminRole && (
              <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
            )}
          </SelectContent>
        </Select>
        {!canCreateAdminRole && (
          <p className="text-xs text-muted-foreground">
            Solo puedes crear usuarios con rol USER
          </p>
        )}
      </div>

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
          disabled={loading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? "Creando..." : "Crear Usuario"}
        </Button>
      </div>
    </form>
  );
}

