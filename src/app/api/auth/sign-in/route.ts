import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { signInSchema } from "@/lib/validations";
import { prisma } from "@/lib/prisma/client";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body
    const validatedData = signInSchema.parse(body);

    // Create Supabase client for API route
    const supabase = await createClient();

    // Sign in user
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error("Failed to create session");
    }

    // Get user profile
    const profile = await prisma.profile.findUnique({
      where: {
        authUserId: data.user.id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        forcePasswordChange: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        {
          error: "Perfil de usuario no encontrado",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Inicio de sesión exitoso",
        user: {
          id: data.user.id,
          email: data.user.email,
          name: profile.name,
          role: profile.role,
        },
        requiresPasswordChange: profile.forcePasswordChange,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Sign in error:", error);

    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      if (
        errorMessage.includes("invalid") ||
        errorMessage.includes("email") ||
        errorMessage.includes("password") ||
        errorMessage.includes("credentials")
      ) {
        return NextResponse.json(
          {
            error: "Email o contraseña incorrectos",
          },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Error al iniciar sesión",
      },
      { status: 500 }
    );
  }
}

