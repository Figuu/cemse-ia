import { NextRequest, NextResponse } from "next/server";
import { requireAuth, extractAuthData } from "@/lib/api/permissions";
import { updatePassword } from "@/lib/auth";
import { changePasswordSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma/client";

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();

    if (!authResult.success) {
      return authResult.response;
    }

    const { profile } = extractAuthData(authResult);

    const body = await request.json();

    // Validate request body
    const validatedData = changePasswordSchema.parse(body);

    // Update password
    await updatePassword(validatedData.newPassword);

    // Update forcePasswordChange flag to false
    const updatedProfile = await prisma.profile.update({
      where: {
        id: profile.id,
      },
      data: {
        forcePasswordChange: false,
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
        message: "Contraseña actualizada exitosamente",
        profile: updatedProfile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Change password error:", error);

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
        error: "Error al cambiar la contraseña",
      },
      { status: 500 }
    );
  }
}
