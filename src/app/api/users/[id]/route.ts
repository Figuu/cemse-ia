import { NextRequest, NextResponse } from "next/server";
import { requireAuth, extractAuthData } from "@/lib/api/permissions";
import { updateUserSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma/client";
import { canModifyUser } from "@/lib/permissions";

// GET - Get user by ID
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const authResult = await requireAuth();

    if (!authResult.success) {
      return authResult.response;
    }

    const { user: currentUser, profile: currentProfile } =
      extractAuthData(authResult);

    // Get user profile
    const userProfile = await prisma.profile.findUnique({
      where: {
        id: resolvedParams.id,
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
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!userProfile) {
      return NextResponse.json(
        {
          error: "Usuario no encontrado",
        },
        { status: 404 }
      );
    }

    // Check if user can access this profile
    // Admin or Super Admin can access any profile
    // Regular users can only access their own profile
    const isAdmin =
      currentProfile.role === "ADMIN" || currentProfile.role === "SUPER_ADMIN";

    if (!isAdmin && currentUser.id !== userProfile.authUserId) {
      return NextResponse.json(
        {
          error: "No tienes permisos para ver este perfil",
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: userProfile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get user error:", error);

    return NextResponse.json(
      {
        error: "Error al obtener el usuario",
      },
      { status: 500 }
    );
  }
}

// PATCH - Update user
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const authResult = await requireAuth();

    if (!authResult.success) {
      return authResult.response;
    }

    const { user: currentUser } = extractAuthData(authResult);

    // Get target user
    const targetUser = await prisma.profile.findUnique({
      where: {
        id: resolvedParams.id,
      },
      select: {
        authUserId: true,
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

    // Check if user can modify this user
    const canModify = await canModifyUser(
      currentUser.id,
      targetUser.authUserId
    );

    if (!canModify) {
      return NextResponse.json(
        {
          error: "No tienes permisos para modificar este usuario",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate request body
    const validatedData = updateUserSchema.parse(body);

    // If trying to change role, check permissions
    if (validatedData.role && validatedData.role !== targetUser.role) {
      // Only Super Admin can change roles
      const authSuperAdminResult = await requireAuth();
      if (!authSuperAdminResult.success) {
        return authSuperAdminResult.response;
      }
      const { profile } = extractAuthData(authSuperAdminResult);

      if (profile.role !== "SUPER_ADMIN") {
        return NextResponse.json(
          {
            error:
              "Solo super administradores pueden cambiar roles de usuarios",
          },
          { status: 403 }
        );
      }

      // Prevent changing own role to lower privilege
      if (profile.authUserId === targetUser.authUserId) {
        return NextResponse.json(
          {
            error: "No puedes cambiar tu propio rol",
          },
          { status: 403 }
        );
      }
    }

    // Update user
    const updatedUser = await prisma.profile.update({
      where: {
        id: resolvedParams.id,
      },
      data: {
        name: validatedData.name,
        phone: validatedData.phone,
        department: validatedData.department,
        biography: validatedData.biography,
        pfpUrl: validatedData.pfpUrl,
        role: validatedData.role,
        forcePasswordChange: validatedData.forcePasswordChange,
        ...(validatedData.schoolId !== undefined && { schoolId: validatedData.schoolId }),
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
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Usuario actualizado exitosamente",
        user: updatedUser,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update user error:", error);

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
        error: "Error al actualizar el usuario",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const authResult = await requireAuth();

    if (!authResult.success) {
      return authResult.response;
    }

    const { user: currentUser, profile: currentProfile } =
      extractAuthData(authResult);

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

    // Prevent self-deletion
    if (currentUser.id === targetUser.authUserId) {
      return NextResponse.json(
        {
          error: "No puedes eliminarte a ti mismo",
        },
        { status: 403 }
      );
    }

    // Check if user can delete this user
    // Only admin or super admin can delete users
    const isAdmin =
      currentProfile.role === "ADMIN" || currentProfile.role === "SUPER_ADMIN";

    if (!isAdmin) {
      return NextResponse.json(
        {
          error: "Solo administradores pueden eliminar usuarios",
        },
        { status: 403 }
      );
    }

    // Super Admin can delete anyone
    // Admin can only delete DIRECTOR, PROFESOR, and USER roles
    if (currentProfile.role === "ADMIN" && !["DIRECTOR", "PROFESOR", "USER"].includes(targetUser.role)) {
      return NextResponse.json(
        {
          error: "Solo puedes eliminar usuarios con rol DIRECTOR, PROFESOR o USER",
        },
        { status: 403 }
      );
    }

    // Director can only delete PROFESOR in their school
    if (currentProfile.role === "DIRECTOR") {
      const targetProfile = await prisma.profile.findUnique({
        where: { authUserId: targetUser.authUserId },
        select: { schoolId: true, role: true },
      });

      if (targetProfile?.role !== "PROFESOR" || targetProfile.schoolId !== currentProfile.schoolId) {
        return NextResponse.json(
          {
            error: "Solo puedes eliminar profesores de tu colegio",
          },
          { status: 403 }
        );
      }
    }

    // Delete user
    await prisma.profile.delete({
      where: {
        id: resolvedParams.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Usuario eliminado exitosamente",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete user error:", error);

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
        error: "Error al eliminar el usuario",
      },
      { status: 500 }
    );
  }
}
