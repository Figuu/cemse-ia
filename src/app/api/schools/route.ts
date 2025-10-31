import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { createSchoolSchema } from "@/lib/validations";
import { requireAuthAndAdmin } from "@/lib/api/permissions";
import { getSession } from "@/lib/auth";
import { isDirector } from "@/lib/permissions";
import { logCreate } from "@/lib/audit";

/**
 * GET /api/schools
 * Get list of schools with pagination and filters
 * Accessible by ADMIN, SUPER_ADMIN (all schools) and DIRECTOR (their school only)
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Check if user is director
    const userIsDirector = await isDirector(session.user.id);

    // Build where clause
    const where: any = {
      isDeleted: false, // Only show non-deleted schools
    };

    // Directors can only see their school
    if (userIsDirector) {
      const profile = await prisma.profile.findUnique({
        where: { authUserId: session.user.id },
        select: { schoolId: true },
      });

      if (!profile?.schoolId) {
        return NextResponse.json(
          { data: [], total: 0, page, limit, totalPages: 0 },
          { status: 200 }
        );
      }

      where.id = profile.schoolId;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { code: { contains: search, mode: "insensitive" } },
        { district: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type) {
      where.type = type;
    }

    const [schools, total] = await Promise.all([
      prisma.school.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { users: true },
          },
        },
      }),
      prisma.school.count({ where }),
    ]);

    return NextResponse.json({
      data: schools,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching schools:", error);
    return NextResponse.json(
      { error: "Error al obtener los colegios" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/schools
 * Create a new school
 * Only ADMIN and SUPER_ADMIN can create schools
 */
export async function POST(request: NextRequest) {
  try {
    // Require admin permissions
    const authError = await requireAuthAndAdmin();
    if (authError) {
      return authError;
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

    const body = await request.json();

    // Validate input
    const validationResult = createSchoolSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    // Check if code already exists (not deleted)
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

    // Create school
    const school = await prisma.school.create({
      data: {
        name: data.name,
        code: data.code,
        type: data.type,
        address: data.address,
        district: data.district,
        phone: data.phone,
        email: data.email || null,
      } as any,
      include: {
        _count: {
          select: { users: true, cases: true },
        },
      },
    });

    // Create audit log
    await logCreate(
      'School',
      school.id,
      school.name,
      currentUser.id,
      {
        type: school.type,
        code: (school as any).code,
      }
    );

    return NextResponse.json(school, { status: 201 });
  } catch (error) {
    console.error("Error creating school:", error);
    return NextResponse.json(
      { error: "Error al crear el colegio" },
      { status: 500 }
    );
  }
}
