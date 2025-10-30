import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { UpdateProfileInput } from "@/lib/validations";

interface Profile {
  id: string;
  authUserId: string;
  email: string;
  name: string;
  phone: string | null;
  department: string | null;
  pfpUrl: string | null;
  biography: string | null;
  role: string;
  forcePasswordChange: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function useProfile() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current profile
  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await fetch("/api/profile");
      if (!response.ok) {
        throw new Error("Error al obtener el perfil");
      }
      const data = await response.json();
      return data.profile as Profile;
    },
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (data: UpdateProfileInput) => {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al actualizar el perfil");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast({
        title: "Perfil actualizado",
        description: "Tu información se ha actualizado correctamente",
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

  // Change password mutation
  const changePassword = useMutation({
    mutationFn: async (data: {
      currentPassword?: string;
      newPassword: string;
      confirmPassword: string;
    }) => {
      const response = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al cambiar la contraseña");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Contraseña actualizada",
        description: "Tu contraseña se ha actualizado correctamente",
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

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfile.mutate,
    changePassword: changePassword.mutate,
    isUpdating: updateProfile.isPending,
    isChangingPassword: changePassword.isPending,
  };
}

