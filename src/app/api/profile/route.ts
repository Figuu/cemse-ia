import { NextRequest, NextResponse } from "next/server";
import { requireAuth, extractAuthData } from "@/lib/api/permissions";
import { updateProfileSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma/client";

export async function GET() {
  try {
    const authResult = await requireAuth();

    if (!authResult.success) {
      return authResult.response;
    }

    const { profile: authProfile } = extractAuthData(authResult);

    // Get full profile from database
    const fullProfile = await prisma.profile.findUnique({
      where: {
        id: authProfile.id,
      },
      select: {
        id: true,
        authUserId: true,
        email: true,
        name: true,
        phone: true,
        department: true,
        pfpUrl: true,
        biography: true,
        role: true,
        forcePasswordChange: true,
        schoolId: true,
        school: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
            address: true,
            district: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!fullProfile) {
      return NextResponse.json(
        {
          error: "Perfil no encontrado",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        profile: fullProfile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get profile error:", error);

    return NextResponse.json(
      {
        error: "Error al obtener el perfil",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authResult = await requireAuth();

    if (!authResult.success) {
      return authResult.response;
    }

    const { profile } = extractAuthData(authResult);

    const body = await request.json();

    // Validate request body
    const validatedData = updateProfileSchema.parse(body);

    // Update profile
    const updatedProfile = await prisma.profile.update({
      where: {
        id: profile.id,
      },
      data: {
        name: validatedData.name,
        phone: validatedData.phone,
        department: validatedData.department,
        biography: validatedData.biography,
        pfpUrl: validatedData.pfpUrl || null,
      },
      select: {
        id: true,
        authUserId: true,
        email: true,
        name: true,
        phone: true,
        department: true,
        pfpUrl: true,
        biography: true,
        role: true,
        forcePasswordChange: true,
        schoolId: true,
        school: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
            address: true,
            district: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Perfil actualizado exitosamente",
        profile: updatedProfile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update profile error:", error);

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
        error: "Error al actualizar el perfil",
      },
      { status: 500 }
    );
  }
}
