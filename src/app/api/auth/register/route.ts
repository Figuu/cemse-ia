import { NextRequest, NextResponse } from "next/server";
import { signUp } from "@/lib/auth";
import { signUpSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = signUpSchema.parse(body);

    // Check if email already exists
    const existingProfile = await prisma.profile.findUnique({
      where: { email: validatedData.email },
    });

    if (existingProfile) {
      return NextResponse.json(
        {
          error: "Este correo electrónico ya está registrado",
        },
        { status: 409 }
      );
    }

    // Create user
    const result = await signUp({
      email: validatedData.email,
      password: validatedData.password,
      name: validatedData.name,
      phone: validatedData.phone,
      department: validatedData.department,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Usuario registrado exitosamente",
        user: {
          id: result.user.id,
          email: result.user.email,
          name: result.profile.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);

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
        error: "Error al registrar usuario",
      },
      { status: 500 }
    );
  }
}

