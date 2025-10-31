import { NextRequest, NextResponse } from "next/server";
import { requireAuth, extractAuthData } from "@/lib/api/permissions";
import { prisma } from "@/lib/prisma/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { LibraryVisibility } from "@prisma/client";

const LIBRARY_BUCKET = "library";

// GET - Get a specific library item
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    const { profile } = extractAuthData(authResult);
    const { id } = await params;

    const item = await prisma.libraryItem.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        school: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!item || item.isDeleted) {
      return NextResponse.json(
        { error: "Elemento no encontrado" },
        { status: 404 }
      );
    }

    // Check permissions
    const canView =
      profile.role === "ADMIN" ||
      profile.role === "SUPER_ADMIN" ||
      (profile.role === "DIRECTOR" &&
        profile.schoolId &&
        (item.schoolId === profile.schoolId ||
          (item.visibility === "PUBLIC" && item.isApproved))) ||
      (profile.role === "PROFESOR" &&
        profile.schoolId &&
        ((item.schoolId === profile.schoolId && item.visibility === "PRIVATE") ||
          (item.visibility === "PUBLIC" && item.isApproved)));

    if (!canView) {
      return NextResponse.json(
        { error: "No tienes permisos para ver este elemento" },
        { status: 403 }
      );
    }

    // Convert BigInt to string for JSON serialization
    const serializedItem = {
      ...item,
      fileSize: item.fileSize.toString(),
    };

    return NextResponse.json(
      {
        success: true,
        item: serializedItem,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get library item error:", error);
    return NextResponse.json(
      {
        error: "Error al obtener el elemento",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// PATCH - Update a library item
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    const { profile } = extractAuthData(authResult);
    const { id } = await params;

    const item = await prisma.libraryItem.findUnique({
      where: { id },
    });

    if (!item || item.isDeleted) {
      return NextResponse.json(
        { error: "Elemento no encontrado" },
        { status: 404 }
      );
    }

    // Check permissions:
    // - Admins can edit any item
    // - Directors can edit items they created for their school
    const canEdit =
      profile.role === "ADMIN" ||
      profile.role === "SUPER_ADMIN" ||
      (profile.role === "DIRECTOR" &&
        item.createdBy === profile.id &&
        item.schoolId === profile.schoolId);

    if (!canEdit) {
      return NextResponse.json(
        { error: "No tienes permisos para editar este elemento" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, visibility } = body;

    // If visibility changes from PRIVATE to PUBLIC for director-uploaded items, need approval
    let updateData: any = {};
    if (title) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    if (visibility && visibility !== item.visibility) {
      updateData.visibility = visibility;
      // If director changes to PUBLIC, needs approval
      if (
        profile.role === "DIRECTOR" &&
        visibility === "PUBLIC" &&
        item.visibility === "PRIVATE"
      ) {
        updateData.isApproved = false;
        updateData.approvedAt = null;
        updateData.approvedBy = null;
      } else if (
        (profile.role === "ADMIN" || profile.role === "SUPER_ADMIN") &&
        visibility === "PUBLIC"
      ) {
        // Admin changes to PUBLIC are auto-approved
        updateData.isApproved = true;
        updateData.approvedAt = new Date();
        updateData.approvedBy = profile.id;
      }
    }

    const updatedItem = await prisma.libraryItem.update({
      where: { id },
      data: updateData,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
        school: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        approver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    // Convert BigInt to string for JSON serialization
    const serializedItem = {
      ...updatedItem,
      fileSize: updatedItem.fileSize.toString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: "Elemento actualizado exitosamente",
        item: serializedItem,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update library item error:", error);
    return NextResponse.json(
      {
        error: "Error al actualizar el elemento",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete a library item
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    const { profile } = extractAuthData(authResult);
    const { id } = await params;

    const item = await prisma.libraryItem.findUnique({
      where: { id },
    });

    if (!item || item.isDeleted) {
      return NextResponse.json(
        { error: "Elemento no encontrado" },
        { status: 404 }
      );
    }

    // Check permissions:
    // - Admins can delete any item
    // - Directors can delete items they created for their school
    const canDelete =
      profile.role === "ADMIN" ||
      profile.role === "SUPER_ADMIN" ||
      (profile.role === "DIRECTOR" &&
        item.createdBy === profile.id &&
        item.schoolId === profile.schoolId);

    if (!canDelete) {
      return NextResponse.json(
        { error: "No tienes permisos para eliminar este elemento" },
        { status: 403 }
      );
    }

    // Soft delete
    await prisma.libraryItem.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: profile.id,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Elemento eliminado exitosamente",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete library item error:", error);
    return NextResponse.json(
      {
        error: "Error al eliminar el elemento",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

