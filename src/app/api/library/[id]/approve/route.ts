import { NextRequest, NextResponse } from "next/server";
import { requireAuthAndAdmin, extractAuthData } from "@/lib/api/permissions";
import { prisma } from "@/lib/prisma/client";

// POST - Approve a library item (only for director-uploaded PUBLIC items)
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await requireAuthAndAdmin();
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
            role: true,
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

    // Only approve director-uploaded PUBLIC items
    if (
      item.creator.role !== "DIRECTOR" ||
      item.visibility !== "PUBLIC" ||
      item.isApproved
    ) {
      return NextResponse.json(
        {
          error:
            "Solo se pueden aprobar elementos públicos subidos por directores que aún no están aprobados",
        },
        { status: 400 }
      );
    }

    const updatedItem = await prisma.libraryItem.update({
      where: { id },
      data: {
        isApproved: true,
        approvedAt: new Date(),
        approvedBy: profile.id,
      },
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
        message: "Elemento aprobado exitosamente",
        item: serializedItem,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Approve library item error:", error);
    return NextResponse.json(
      {
        error: "Error al aprobar el elemento",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

