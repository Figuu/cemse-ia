import { NextResponse } from "next/server";
import { requireAuth, extractAuthData } from "@/lib/api/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma/client";

export async function DELETE() {
  try {
    const authResult = await requireAuth();

    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = extractAuthData(authResult);

    // Get current profile picture URL
    const currentProfile = await prisma.profile.findUnique({
      where: {
        authUserId: user.id,
      },
      select: {
        pfpUrl: true,
      },
    });

    if (!currentProfile?.pfpUrl) {
      return NextResponse.json(
        {
          error: "No hay imagen de perfil para eliminar",
        },
        { status: 404 }
      );
    }

    // Extract filename from URL
    const urlParts = currentProfile.pfpUrl.split("/");
    const fileName = urlParts[urlParts.length - 1];

    // Delete from Supabase Storage
    const supabase = createAdminClient();
    const { error: deleteError } = await supabase.storage
      .from("user-profile-pictures")
      .remove([fileName]);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return NextResponse.json(
        {
          error: "Error al eliminar el archivo",
        },
        { status: 500 }
      );
    }

    // Update profile to remove picture URL
    const updatedProfile = await prisma.profile.update({
      where: {
        authUserId: user.id,
      },
      data: {
        pfpUrl: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        pfpUrl: true,
        role: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Archivo eliminado exitosamente",
        profile: updatedProfile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("File delete error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        error: "Error al eliminar el archivo",
      },
      { status: 500 }
    );
  }
}
