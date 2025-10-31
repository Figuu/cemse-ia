"use client";

import { useState, useEffect } from "react";
import { Role, SchoolType } from "@prisma/client";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { translateRole, translateSchoolType } from "@/lib/translations";
import { toast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff, Copy } from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

interface UserData {
  id?: string;
  email: string;
  name: string;
  phone?: string;
  department?: string;
  role: Role;
  schoolId?: string | null;
  forcePasswordChange?: boolean;
}

interface School {
  id: string;
  name: string;
  code: string;
  type: SchoolType;
}

interface UserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user?: UserData | null;
  preselectedSchoolId?: string;
  onSuccess?: () => void;
}

export function UserModal({
  open,
  onOpenChange,
  user,
  preselectedSchoolId,
  onSuccess,
}: UserModalProps) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [schools, setSchools] = useState<School[]>([]);
  const [loadingSchools, setLoadingSchools] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState<UserData>({
    email: "",
    name: "",
    phone: "",
    department: "",
    role: "USER",
    schoolId: preselectedSchoolId || null,
    forcePasswordChange: true,
  });

  // Determine available roles based on current user's role
  const getAvailableRoles = (): Role[] => {
    if (profile?.role === "SUPER_ADMIN") {
      return ["SUPER_ADMIN", "ADMIN", "DIRECTOR", "PROFESOR", "USER"];
    } else if (profile?.role === "ADMIN") {
      return ["DIRECTOR", "PROFESOR", "USER"];
    } else if (profile?.role === "DIRECTOR") {
      return ["PROFESOR"];
    }
    return ["USER"];
  };

  const availableRoles = getAvailableRoles();

  // Check if school selection is required
  const isSchoolRequired = ["DIRECTOR", "PROFESOR"].includes(formData.role);

  // Load schools list
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setLoadingSchools(true);
        const response = await fetch("/api/schools/list");
        const data = await response.json();

        if (!response.ok) {
          throw new Error("Error al cargar los colegios");
        }

        setSchools(data || []);
      } catch (error) {
        toast({
          title: "Error al cargar la lista de colegios",
          variant: "destructive",
        });
      } finally {
        setLoadingSchools(false);
      }
    };

    if (open) {
      fetchSchools();
    }
  }, [open]);

  // Load user data when editing
  useEffect(() => {
    if (user) {
      setFormData({
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone || "",
        department: user.department || "",
        role: user.role,
        schoolId: user.schoolId || null,
        forcePasswordChange: user.forcePasswordChange || false,
      });
      setTemporaryPassword(null);
    } else {
      // Reset form when creating new
      setFormData({
        email: "",
        name: "",
        phone: "",
        department: "",
        role: availableRoles[0] || "USER",
        schoolId: preselectedSchoolId || null,
        forcePasswordChange: true,
      });
      setTemporaryPassword(null);
    }
  }, [user, open, preselectedSchoolId, availableRoles]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate school assignment for DIRECTOR and PROFESOR
    if (isSchoolRequired && !formData.schoolId) {
      toast({
        title: "Debes asignar un colegio para este rol",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const url = user ? `/api/users/${user.id}` : "/api/users";
      const method = user ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar el usuario");
      }

      if (!user && data.temporaryPassword) {
        // New user created, show temporary password
        setTemporaryPassword(data.temporaryPassword);
        toast({
          title: "Usuario creado exitosamente",
        });
      } else {
        toast({
          title: "Usuario actualizado exitosamente",
        });
        onOpenChange(false);
        onSuccess?.();
      }
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Error al guardar el usuario",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const copyPassword = () => {
    if (temporaryPassword) {
      navigator.clipboard.writeText(temporaryPassword);
      toast({
        title: "Contraseña copiada al portapapeles",
      });
    }
  };

  const handleClose = () => {
    setTemporaryPassword(null);
    onOpenChange(false);
    if (temporaryPassword) {
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {user ? "Editar Usuario" : "Crear Nuevo Usuario"}
          </DialogTitle>
          <DialogDescription>
            {user
              ? "Actualiza la información del usuario"
              : "Completa los datos del nuevo usuario"}
          </DialogDescription>
        </DialogHeader>

        {temporaryPassword ? (
          <div className="space-y-4">
            <Alert>
              <AlertTitle>Usuario creado exitosamente</AlertTitle>
              <AlertDescription>
                Comparte esta contraseña temporal con el usuario. Será solicitado cambiarla en su primer inicio de sesión.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label>Correo Electrónico</Label>
              <Input value={formData.email} disabled />
            </div>

            <div className="space-y-2">
              <Label>Contraseña Temporal</Label>
              <div className="flex gap-2">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={temporaryPassword}
                  readOnly
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={copyPassword}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <DialogFooter>
              <Button onClick={handleClose}>Cerrar</Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">
                  Nombre Completo <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ej: Juan Pérez"
                  required
                  disabled={loading}
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Correo Electrónico <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Ej: juan@ejemplo.com"
                  required
                  disabled={loading || !!user}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Teléfono</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  placeholder="Ej: +51 999 999 999"
                  disabled={loading}
                />
              </div>

              {/* Department */}
              <div className="space-y-2">
                <Label htmlFor="department">Departamento</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({ ...formData, department: e.target.value })
                  }
                  placeholder="Ej: Administración"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label htmlFor="role">
                Rol <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.role}
                onValueChange={(value: Role) =>
                  setFormData({ ...formData, role: value })
                }
                disabled={loading}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableRoles.map((role) => (
                    <SelectItem key={role} value={role}>
                      {translateRole(role)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* School Selection */}
            {(profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN" || isSchoolRequired) && (
              <div className="space-y-2">
                <Label htmlFor="school">
                  Colegio {isSchoolRequired && <span className="text-red-500">*</span>}
                </Label>
                <Select
                  value={formData.schoolId || "none"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, schoolId: value === "none" ? null : value })
                  }
                  disabled={loading || loadingSchools || profile?.role === "DIRECTOR"}
                >
                  <SelectTrigger id="school">
                    <SelectValue placeholder="Seleccionar colegio" />
                  </SelectTrigger>
                  <SelectContent>
                    {!isSchoolRequired && (
                      <SelectItem value="none">Sin colegio</SelectItem>
                    )}
                    {schools.map((school) => (
                      <SelectItem key={school.id} value={school.id}>
                        {school.name} ({translateSchoolType(school.type)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Force Password Change */}
            {!user && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="forcePasswordChange"
                  checked={formData.forcePasswordChange}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, forcePasswordChange: checked as boolean })
                  }
                  disabled={loading}
                />
                <Label
                  htmlFor="forcePasswordChange"
                  className="text-sm font-normal cursor-pointer"
                >
                  Solicitar cambio de contraseña en el primer inicio de sesión
                </Label>
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {user ? "Actualizar" : "Crear"} Usuario
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
