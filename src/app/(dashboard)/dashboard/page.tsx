"use client";

import { useAuth } from "@/context/AuthContext";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { AdminDashboard } from "@/components/dashboard/AdminDashboard";
import { SuperAdminDashboard } from "@/components/dashboard/SuperAdminDashboard";
import { SchoolDashboard } from "@/components/dashboard/SchoolDashboard";
import { ForcePasswordChangeModal } from "@/components/ForcePasswordChangeModal";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { profile, loading } = useAuth();
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [schoolData, setSchoolData] = useState<any>(null);
  const [loadingSchool, setLoadingSchool] = useState(false);

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

  // Fetch school data for Director and Profesor
  useEffect(() => {
    const fetchSchoolData = async () => {
      if (!profile || !profile.schoolId) return;
      if (profile.role !== "DIRECTOR" && profile.role !== "PROFESOR") return;

      setLoadingSchool(true);
      try {
        // Fetch school data and metrics in parallel
        const [schoolResponse, metricsResponse] = await Promise.all([
          fetch(`/api/schools/${profile.schoolId}`),
          fetch(`/api/schools/${profile.schoolId}/metrics`).catch(() => null), // Metrics are optional
        ]);

        const schoolData = await schoolResponse.json();
        if (schoolResponse.ok) {
          // Add metrics if available
          if (metricsResponse) {
            try {
              const metricsData = await metricsResponse.json();
              if (metricsResponse.ok && metricsData) {
                schoolData.metrics = metricsData;
              }
            } catch (e) {
              // Ignore metrics errors
            }
          }
          setSchoolData(schoolData);
        }
      } catch (error) {
        console.error("Error fetching school data:", error);
      } finally {
        setLoadingSchool(false);
      }
    };

    fetchSchoolData();
  }, [profile]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
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
      case "DIRECTOR":
      case "PROFESOR":
        if (loadingSchool) {
          return (
            <div className="flex min-h-[400px] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          );
        }
        if (!profile.schoolId || !schoolData) {
          return (
            <div className="rounded-lg border bg-muted p-8 text-center">
              <p className="text-lg font-semibold">No tienes un colegio asignado</p>
              <p className="text-sm text-muted-foreground mt-2">
                Por favor, contacta al administrador para que te asigne a un colegio.
              </p>
            </div>
          );
        }
        return (
          <SchoolDashboard
            profile={profile}
            school={schoolData}
            users={schoolData.users || []}
            metrics={schoolData.metrics}
          />
        );
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
