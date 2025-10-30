import { NextRequest, NextResponse } from "next/server";
import { verifyEmail } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        {
          error: "Token de verificación requerido",
        },
        { status: 400 }
      );
    }

    // Verify email with token
    await verifyEmail(token);

    return NextResponse.json(
      {
        success: true,
        message: "Correo electrónico verificado exitosamente",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);

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
        error: "Error al verificar el correo electrónico",
      },
      { status: 500 }
    );
  }
}

