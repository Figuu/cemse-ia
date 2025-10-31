import { NextRequest, NextResponse } from "next/server";
import { requireAuth, extractAuthData } from "@/lib/api/permissions";
import { prisma } from "@/lib/prisma/client";
import { createAdminClient } from "@/lib/supabase/admin";
import { LibraryVisibility } from "@prisma/client";

const LIBRARY_BUCKET = "library";

// GET - Get library items with proper filtering based on role
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    const { profile } = extractAuthData(authResult);
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const visibility = searchParams.get("visibility") as LibraryVisibility | null;

    // Build where clause based on user role and permissions
    const baseConditions: any[] = [
      { isDeleted: false },
    ];

    // Visibility filtering logic:
    // - Admins see everything
    // - Directors see: all items from their school (PUBLIC and PRIVATE), plus approved PUBLIC items from other schools
    // - Teachers see: PRIVATE items from their school, plus approved PUBLIC items from all schools
    if (profile.role === "ADMIN" || profile.role === "SUPER_ADMIN") {
      // Admins see everything - no additional filtering needed
    } else if (profile.role === "DIRECTOR" && profile.schoolId) {
      // Directors see:
      // 1. All items from their school (PUBLIC and PRIVATE)
      // 2. Approved PUBLIC items from other schools
      baseConditions.push({
        OR: [
          { schoolId: profile.schoolId },
          {
            AND: [
              { visibility: "PUBLIC" },
              { isApproved: true },
              { schoolId: { not: profile.schoolId } },
            ],
          },
        ],
      });
    } else if (profile.role === "PROFESOR" && profile.schoolId) {
      // Teachers see:
      // 1. PRIVATE items from their school
      // 2. Approved PUBLIC items from all schools
      baseConditions.push({
        OR: [
          {
            AND: [
              { schoolId: profile.schoolId },
              { visibility: "PRIVATE" },
            ],
          },
          {
            AND: [
              { visibility: "PUBLIC" },
              { isApproved: true },
            ],
          },
        ],
      });
    } else {
      // USER role or no school assigned - no access
      return NextResponse.json(
        {
          success: true,
          items: [],
          pagination: {
            total: 0,
            page: 1,
            limit,
            totalPages: 0,
          },
        },
        { status: 200 }
      );
    }

    // Search filter
    if (search) {
      baseConditions.push({
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { fileName: { contains: search, mode: "insensitive" } },
        ],
      });
    }

    // Visibility filter (only for admins filtering)
    if (visibility && (profile.role === "ADMIN" || profile.role === "SUPER_ADMIN")) {
      baseConditions.push({ visibility });
    }

    // Combine all conditions with AND
    const where = baseConditions.length > 1 ? { AND: baseConditions } : baseConditions[0];

    // Get total count
    const total = await prisma.libraryItem.count({ where });

    // Get items with relations
    const items = await prisma.libraryItem.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Convert BigInt to string for JSON serialization
    const serializedItems = items.map((item) => ({
      ...item,
      fileSize: item.fileSize.toString(),
    }));

    return NextResponse.json(
      {
        success: true,
        items: serializedItems,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get library items error:", error);
    return NextResponse.json(
      {
        error: "Error al obtener los elementos de la biblioteca",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// POST - Upload a new library item
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (!authResult.success) {
      return authResult.response;
    }

    const { profile } = extractAuthData(authResult);

    // Only ADMIN, SUPER_ADMIN, and DIRECTOR can upload
    if (
      profile.role !== "ADMIN" &&
      profile.role !== "SUPER_ADMIN" &&
      profile.role !== "DIRECTOR"
    ) {
      return NextResponse.json(
        { error: "No tienes permisos para subir archivos" },
        { status: 403 }
      );
    }

    // Directors must have a school assigned
    if (profile.role === "DIRECTOR" && !profile.schoolId) {
      return NextResponse.json(
        { error: "Debes tener un colegio asignado para subir archivos" },
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const visibility = (formData.get("visibility") as LibraryVisibility) || "PRIVATE";

    if (!file || !title) {
      return NextResponse.json(
        { error: "Título y archivo son requeridos" },
        { status: 400 }
      );
    }

    // Validate file size (50MB limit for library files)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "El archivo es demasiado grande. El límite es 50MB." },
        { status: 400 }
      );
    }

    // For directors: PUBLIC items require approval, PRIVATE don't
    // For admins: PUBLIC items are auto-approved
    const isApproved =
      profile.role === "ADMIN" || profile.role === "SUPER_ADMIN" || visibility === "PRIVATE";

    // Upload file to Supabase Storage
    const supabase = createAdminClient();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split(".").pop();
    const fileName = `library/${profile.id}/${timestamp}_${randomString}.${fileExt}`;

    const fileBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(fileBuffer);

    const { error: uploadError, data: uploadData } = await supabase.storage
      .from(LIBRARY_BUCKET)
      .upload(fileName, bytes, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        { error: "Error al subir el archivo" },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(LIBRARY_BUCKET).getPublicUrl(uploadData.path);

    // Create library item in database
    const libraryItem = await prisma.libraryItem.create({
      data: {
        title,
        description: description || null,
        fileName: file.name,
        fileUrl: publicUrl,
        fileSize: BigInt(file.size),
        mimeType: file.type,
        visibility,
        isApproved,
        approvedAt: isApproved ? new Date() : null,
        approvedBy: isApproved ? profile.id : null,
        createdBy: profile.id,
        schoolId: profile.schoolId || null,
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
      },
    });

    // Convert BigInt to string for JSON serialization
    const serializedItem = {
      ...libraryItem,
      fileSize: libraryItem.fileSize.toString(),
    };

    return NextResponse.json(
      {
        success: true,
        message: "Archivo subido exitosamente",
        item: serializedItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Upload library item error:", error);
    return NextResponse.json(
      {
        error: "Error al subir el archivo",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

