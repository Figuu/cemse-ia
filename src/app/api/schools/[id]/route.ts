import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { updateSchoolSchema } from "@/lib/validations";
import { requireAuthAndAdmin } from "@/lib/api/permissions";
import { getSession } from "@/lib/auth";
import { canViewSchool } from "@/lib/permissions";
import { logUpdate, logDelete } from "@/lib/audit";

/**
 * GET /api/schools/[id]
 * Get school details by ID
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if user can view this school
    const canAccess = await canViewSchool(session.user.id, id);

    if (!canAccess) {
      return NextResponse.json(
        { error: "No tienes permiso para ver este colegio" },
        { status: 403 }
      );
    }

    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        users: {
          where: { isDeleted: false },
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            pfpUrl: true,
          },
          orderBy: { name: "asc" },
        },
        _count: {
          select: { users: true, cases: true },
        },
      },
    });

    if (!school || school.isDeleted) {
      return NextResponse.json(
        { error: "Colegio no encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(school);
  } catch (error) {
    console.error("Error fetching school:", error);
    return NextResponse.json(
      { error: "Error al obtener el colegio" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/schools/[id]
 * Update school details
 * Only ADMIN and SUPER_ADMIN can update schools
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin permissions
    const authResult = await requireAuthAndAdmin();
    if (!authResult.success) {
      return authResult.response;
    }

    const { id } = await params;
    const body = await request.json();

    // Validate input
    const validationResult = updateSchoolSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const currentUser = await prisma.profile.findUnique({
      where: { authUserId: session.user.id },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    // Check if school exists
    const school = await prisma.school.findUnique({
      where: { id },
    });

    if (!school || (school as any).isDeleted) {
      return NextResponse.json(
        { error: "Colegio no encontrado" },
        { status: 404 }
      );
    }

    // If code is being changed, check if new code already exists
    if (data.code && data.code !== (school as any).code) {
      const existingSchool = await prisma.school.findFirst({
        where: {
          code: data.code,
          isDeleted: false,
        } as any,
      });

      if (existingSchool) {
        return NextResponse.json(
          { error: "Ya existe un colegio con este código" },
          { status: 400 }
        );
      }
    }

    // Track changes for audit log
    const changes: Record<string, any> = {};
    Object.keys(data).forEach(key => {
      const newValue = (data as any)[key];
      const oldValue = (school as any)[key];
      if (newValue !== undefined && newValue !== oldValue) {
        changes[key] = { from: oldValue, to: newValue };
      }
    });

    // Update school
    const updatedSchool = await prisma.school.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.code && { code: data.code }),
        ...(data.type && { type: data.type }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.district !== undefined && { district: data.district }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.email !== undefined && { email: data.email || null }),
      },
      include: {
        _count: {
          select: { users: true, cases: true },
        },
      },
    });

    // Create audit log
    if (Object.keys(changes).length > 0) {
      await logUpdate(
        'School',
        updatedSchool.id,
        updatedSchool.name,
        currentUser.id,
        changes
      );
    }

    return NextResponse.json(updatedSchool);
  } catch (error) {
    console.error("Error updating school:", error);
    return NextResponse.json(
      { error: "Error al actualizar el colegio" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/schools/[id]
 * Soft delete a school
 * Only ADMIN and SUPER_ADMIN can delete schools
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin permissions
    const authResult = await requireAuthAndAdmin();
    if (!authResult.success) {
      return authResult.response;
    }

    const session = await getSession();
    if (!session) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const currentUser = await prisma.profile.findUnique({
      where: { authUserId: session.user.id },
    });

    if (!currentUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      );
    }

    const { id } = await params;

    // Check if school exists
    const school = await prisma.school.findUnique({
      where: { id },
      include: {
        _count: {
          select: { users: true, cases: true },
        },
      },
    });

    if (!school || (school as any).isDeleted) {
      return NextResponse.json(
        { error: "Colegio no encontrado" },
        { status: 404 }
      );
    }

    // Count active users (not deleted)
    const activeUsersCount = await prisma.profile.count({
      where: {
        schoolId: id,
        isDeleted: false,
      },
    });

    // Check if school has active users
    if (activeUsersCount > 0) {
      return NextResponse.json(
        {
          error: `No se puede eliminar el colegio porque tiene ${activeUsersCount} usuario(s) activo(s) asignado(s). Por favor, reasigna o elimina los usuarios primero.`
        },
        { status: 400 }
      );
    }

    // Soft delete school
    await prisma.school.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: currentUser.id,
      } as any,
    });

    // Create audit log
    await logDelete(
      'School',
      school.id,
      school.name,
      currentUser.id
    );

    return NextResponse.json({ message: "Colegio eliminado exitosamente" });
  } catch (error) {
    console.error("Error deleting school:", error);
    return NextResponse.json(
      { error: "Error al eliminar el colegio" },
      { status: 500 }
    );
  }
}
