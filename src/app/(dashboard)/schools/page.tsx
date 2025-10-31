"use client";

import { useState, useEffect, useCallback } from "react";
import { School } from "@prisma/client";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SchoolModal } from "@/components/schools/SchoolModal";
import { translateSchoolType, getSchoolTypeBadgeColor } from "@/lib/translations";
import { toast } from "@/hooks/use-toast";
import { Plus, Search, Pencil, Trash2, Users, Loader2 } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SchoolWithCount extends School {
  code: string;
  district: string | null;
  _count: {
    users: number;
  };
}

export default function SchoolsPage() {
  const { profile } = useAuth();
  const [schools, setSchools] = useState<SchoolWithCount[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSchool, setDeletingSchool] = useState<SchoolWithCount | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canManage = profile?.role === "ADMIN" || profile?.role === "SUPER_ADMIN";

  const fetchSchools = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (typeFilter && typeFilter !== "all") params.append("type", typeFilter);
      params.append("limit", "100");

      const response = await fetch(`/api/schools?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al cargar los colegios");
      }

      setSchools(data.data || []);
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Error al cargar los colegios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [search, typeFilter]);

  useEffect(() => {
    fetchSchools();
  }, [fetchSchools]);

  const handleEdit = (school: School) => {
    setEditingSchool(school);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setEditingSchool(null);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingSchool(null);
  };

  const handleDelete = (school: SchoolWithCount) => {
    setDeletingSchool(school);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingSchool) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/schools/${deletingSchool.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar el colegio");
      }

      toast({
        title: "Colegio eliminado exitosamente",
      });
      fetchSchools();
    } catch (error) {
      toast({
        title: error instanceof Error ? error.message : "Error al eliminar el colegio",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setDeletingSchool(null);
    }
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Colegios</h2>
          <p className="text-muted-foreground">
            Gestiona los colegios del sistema
          </p>
        </div>
        {canManage && (
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nuevo Colegio</span>
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>
            Busca y filtra colegios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nombre, código o distrito..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Tipo de colegio" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="PUBLIC">Público</SelectItem>
                <SelectItem value="PRIVATE">Privado</SelectItem>
                <SelectItem value="SUBSIDIZED">Convenio</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : schools.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              No se encontraron colegios
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Código</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Distrito</TableHead>
                    <TableHead className="text-center">Usuarios</TableHead>
                    {canManage && <TableHead className="text-right">Acciones</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schools.map((school) => (
                    <TableRow key={school.id}>
                      <TableCell className="font-medium">
                        {school.name}
                      </TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-2 py-1 rounded">
                          {school.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <Badge className={getSchoolTypeBadgeColor(school.type)}>
                          {translateSchoolType(school.type)}
                        </Badge>
                      </TableCell>
                      <TableCell>{school.district || "-"}</TableCell>
                      <TableCell className="text-center">
                        <Link
                          href={`/schools/${school.id}`}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Users className="h-4 w-4" />
                          {school._count.users}
                        </Link>
                      </TableCell>
                      {canManage && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(school)}
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(school)}
                              title="Eliminar"
                              disabled={school._count.users > 0}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <SchoolModal
        open={modalOpen}
        onOpenChange={handleModalClose}
        school={editingSchool}
        onSuccess={fetchSchools}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el colegio{" "}
              <strong>{deletingSchool?.name}</strong>. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
