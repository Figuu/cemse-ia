import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { CreateUserInput, UpdateUserInput } from "@/lib/validations";
import type { User } from "@/components/users/UserList";

interface FetchUsersParams {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface FetchUsersResponse {
  users: User[];
  pagination: PaginationData;
}

export function useUsers(params: FetchUsersParams = {}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Build query key
  const queryKey = [
    "users",
    params.search || "",
    params.role || "",
    params.page || 1,
    params.limit || 10,
  ];

  // Fetch users query
  const { data, isLoading, error, refetch } = useQuery<FetchUsersResponse>({
    queryKey,
    queryFn: async () => {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append("search", params.search);
      if (params.role) queryParams.append("role", params.role);
      if (params.page) queryParams.append("page", params.page.toString());
      if (params.limit) queryParams.append("limit", params.limit.toString());

      const response = await fetch(`/api/users?${queryParams.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al obtener los usuarios");
      }

      return data;
    },
  });

  // Create user mutation
  const createUser = useMutation({
    mutationFn: async (userData: CreateUserInput) => {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al crear el usuario");
      }

      return data;
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Usuario creado",
        description: `Usuario creado exitosamente. Contraseña temporal: ${data.temporaryPassword}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUser = useMutation({
    mutationFn: async ({
      userId,
      userData,
    }: {
      userId: string;
      userData: UpdateUserInput;
    }) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar el usuario");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Usuario actualizado",
        description: "El usuario se ha actualizado exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar el usuario");
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Usuario eliminado",
        description: "El usuario se ha eliminado exitosamente",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reset password mutation
  const resetPassword = useMutation({
    mutationFn: async (userId: string) => {
      const response = await fetch(`/api/users/${userId}/reset-password`, {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al restablecer la contraseña");
      }

      return data;
    },
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast({
        title: "Contraseña restablecida",
        description: "Se ha generado una nueva contraseña para el usuario",
      });
      return data;
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return {
    // Query data
    users: data?.users || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,

    // Mutations
    createUser: createUser.mutate,
    updateUser: updateUser.mutate,
    deleteUser: deleteUser.mutate,
    resetPassword: resetPassword.mutate,

    // Mutation states
    isCreating: createUser.isPending,
    isUpdating: updateUser.isPending,
    isDeleting: deleteUser.isPending,
    isResettingPassword: resetPassword.isPending,

    // Mutation data
    createdUser: createUser.data,
    resetPasswordData: resetPassword.data,
  };
}

