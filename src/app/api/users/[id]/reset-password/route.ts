import { NextRequest, NextResponse } from "next/server";
import { requireAuthAndAdmin, extractAuthData } from "@/lib/api/permissions";
import { prisma } from "@/lib/prisma/client";
import { createAdminClient } from "@/lib/supabase/admin";
import crypto from "crypto";

// POST - Reset user password (Admin and Super Admin only)
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const authResult = await requireAuthAndAdmin();

    if (!authResult.success) {
      return authResult.response;
    }

    const { profile: currentProfile } = extractAuthData(authResult);

    // Get target user
    const targetUser = await prisma.profile.findUnique({
      where: {
        id: resolvedParams.id,
      },
      select: {
        authUserId: true,
        email: true,
        role: true,
      },
    });

    if (!targetUser) {
      return NextResponse.json(
        {
          error: "Usuario no encontrado",
        },
        { status: 404 }
      );
    }

    // Super Admin can reset anyone's password
    // Admin can only reset regular user passwords
    if (currentProfile.role === "ADMIN" && targetUser.role !== "USER") {
      return NextResponse.json(
        {
          error:
            "Solo puedes restablecer la contraseña de usuarios con rol USER",
        },
        { status: 403 }
      );
    }

    // Generate new random password
    const newPassword = crypto.randomBytes(16).toString("hex");

    // Update password in Supabase Auth
    const supabase = createAdminClient();
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      targetUser.authUserId,
      {
        password: newPassword,
      }
    );

    if (updateError) {
      console.error("Password update error:", updateError);
      return NextResponse.json(
        {
          error: "Error al actualizar la contraseña en Supabase",
        },
        { status: 500 }
      );
    }

    // Update forcePasswordChange flag to true
    const updatedProfile = await prisma.profile.update({
      where: {
        id: resolvedParams.id,
      },
      data: {
        forcePasswordChange: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        forcePasswordChange: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Contraseña restablecida exitosamente",
        user: updatedProfile,
        newPassword, // Return for admin to share
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);

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
        error: "Error al restablecer la contraseña",
      },
      { status: 500 }
    );
  }
}
