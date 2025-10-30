import { NextRequest, NextResponse } from "next/server";
import { requireAuthAndAdmin, extractAuthData } from "@/lib/api/permissions";
import { prisma } from "@/lib/prisma/client";
import { createUserSchema } from "@/lib/validations";
import { signUp } from "@/lib/auth";
import crypto from "crypto";

// GET - Get all users (Admin and Super Admin only)
export async function GET(request: NextRequest) {
  try {
    const authResult = await requireAuthAndAdmin();

    if (!authResult.success) {
      return authResult.response;
    }

    // Get search params
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search") || "";
    const role = searchParams.get("role") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build where clause
    const where: {
      OR?: Array<{
        name?: { contains: string; mode: "insensitive" };
        email?: { contains: string; mode: "insensitive" };
      }>;
      role?: "USER" | "ADMIN" | "SUPER_ADMIN";
    } = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (role) {
      where.role = role as "USER" | "ADMIN" | "SUPER_ADMIN";
    }

    // Get total count
    const total = await prisma.profile.count({ where });

    // Get users
    const users = await prisma.profile.findMany({
      where,
      take: limit,
      skip: (page - 1) * limit,
      orderBy: {
        createdAt: "desc",
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
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        users,
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
    console.error("Get users error:", error);

    return NextResponse.json(
      {
        error: "Error al obtener los usuarios",
      },
      { status: 500 }
    );
  }
}

// POST - Create a new user (Admin and Super Admin only)
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuthAndAdmin();

    if (!authResult.success) {
      return authResult.response;
    }

    const { profile: currentProfile } = extractAuthData(authResult);

    const body = await request.json();

    // Validate request body
    const validatedData = createUserSchema.parse(body);

    // Check if user can create this role
    const targetRole = validatedData.role as "USER" | "ADMIN" | "SUPER_ADMIN";

    // Super Admin can create any role
    if (currentProfile.role !== "SUPER_ADMIN") {
      // Admin can only create USER role
      if (targetRole !== "USER") {
        return NextResponse.json(
          {
            error: "Solo puedes crear usuarios con rol USER",
          },
          { status: 403 }
        );
      }
    }

    // Generate random password
    const randomPassword = crypto.randomBytes(16).toString("hex");

    // Create user in Supabase Auth
    const authData = await signUp({
      email: validatedData.email,
      password: randomPassword,
      name: validatedData.name,
      phone: validatedData.phone,
      department: validatedData.department,
    });

    if (!authData?.user) {
      return NextResponse.json(
        {
          error: "Error al crear el usuario en Supabase",
        },
        { status: 500 }
      );
    }

    // Get created profile
    const profile = await prisma.profile.findUnique({
      where: {
        authUserId: authData.user.id,
      },
    });

    if (!profile) {
      return NextResponse.json(
        {
          error: "Error al obtener el perfil del usuario creado",
        },
        { status: 500 }
      );
    }

    // Update profile with role and forcePasswordChange if needed
    const updatedProfile = await prisma.profile.update({
      where: {
        authUserId: authData.user.id,
      },
      data: {
        role: targetRole,
        forcePasswordChange: validatedData.forcePasswordChange || false,
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
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Usuario creado exitosamente",
        user: updatedProfile,
        temporaryPassword: randomPassword, // Return for admin to share
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create user error:", error);

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
        error: "Error al crear el usuario",
      },
      { status: 500 }
    );
  }
}
