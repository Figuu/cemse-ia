"use client";

import { useAuth } from "@/context/AuthContext";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { SuperAdminDashboard } from "@/components/dashboard/SuperAdminDashboard";
import { ForcePasswordChangeModal } from "@/components/ForcePasswordChangeModal";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!loading && !profile) {
      router.push("/sign-in");
    }
  }, [profile, loading, router]);

  useEffect(() => {
    // Show modal if password change is required
    if (profile?.forcePasswordChange) {
      setShowModal(true);
    }
  }, [profile?.forcePasswordChange]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  // Role-based dashboard content switching
  const renderDashboard = () => {
    switch (profile.role) {
      case "SUPER_ADMIN":
        return <SuperAdminDashboard />;
      case "ADMIN":
        return <AdminDashboard />;
      case "USER":
      default:
        return <UserDashboard profile={profile} />;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <ForcePasswordChangeModal open={showModal} />
      {renderDashboard()}
    </div>
  );
}
