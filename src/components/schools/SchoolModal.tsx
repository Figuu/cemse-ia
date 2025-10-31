"use client";

import { useState, useEffect } from "react";
import { School, SchoolType } from "@prisma/client";
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
import { translateSchoolType } from "@/lib/translations";
import { toast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface SchoolModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  school?: School | null;
  onSuccess?: () => void;
}

export function SchoolModal({
  open,
  onOpenChange,
  school,
  onSuccess,
}: SchoolModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    type: "PUBLIC" as SchoolType,
    address: "",
    district: "",
    phone: "",
    email: "",
  });

  // Load school data when editing
  useEffect(() => {
    if (school) {
      setFormData({
        name: school.name,
        code: school.code,
        type: school.type,
        address: school.address || "",
        district: school.district || "",
        phone: school.phone || "",
        email: school.email || "",
      });
    } else {
      // Reset form when creating new
      setFormData({
        name: "",
        code: "",
        type: "PUBLIC",
        address: "",
        district: "",
        phone: "",
        email: "",
      });
    }
  }, [school, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = school ? `/api/schools/${school.id}` : "/api/schools";
      const method = school ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al guardar el colegio");
      }

      toast({
        title: school ? "Colegio actualizado exitosamente" : "Colegio creado exitosamente",
      });
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Error al guardar el colegio",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {school ? "Editar Colegio" : "Crear Nuevo Colegio"}
          </DialogTitle>
          <DialogDescription>
            {school
              ? "Actualiza la información del colegio"
              : "Completa los datos del nuevo colegio"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Nombre del Colegio <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="Ej: Colegio Nacional"
                required
                disabled={loading}
              />
            </div>

            {/* Code */}
            <div className="space-y-2">
              <Label htmlFor="code">
                Código <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    code: e.target.value.toUpperCase(),
                  })
                }
                placeholder="Ej: COL-001"
                required
                disabled={loading}
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                Solo letras mayúsculas, números y guiones
              </p>
            </div>
          </div>

          {/* Type */}
          <div className="space-y-2">
            <Label htmlFor="type">
              Tipo de Colegio <span className="text-red-500">*</span>
            </Label>
            <Select
              value={formData.type}
              onValueChange={(value: SchoolType) =>
                setFormData({ ...formData, type: value })
              }
              disabled={loading}
            >
              <SelectTrigger id="type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PUBLIC">
                  {translateSchoolType("PUBLIC")}
                </SelectItem>
                <SelectItem value="PRIVATE">
                  {translateSchoolType("PRIVATE")}
                </SelectItem>
                <SelectItem value="SUBSIDIZED">
                  {translateSchoolType("SUBSIDIZED")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              placeholder="Ej: Av. Principal 123"
              disabled={loading}
              maxLength={500}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* District */}
            <div className="space-y-2">
              <Label htmlFor="district">Distrito</Label>
              <Input
                id="district"
                value={formData.district}
                onChange={(e) =>
                  setFormData({ ...formData, district: e.target.value })
                }
                placeholder="Ej: San Isidro"
                disabled={loading}
                maxLength={100}
              />
            </div>

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
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Correo Electrónico</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="Ej: contacto@colegio.edu.pe"
              disabled={loading}
            />
          </div>

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
              {school ? "Actualizar" : "Crear"} Colegio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
