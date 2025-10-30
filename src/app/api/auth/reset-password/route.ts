import { NextRequest, NextResponse } from "next/server";
import { requestPasswordReset, resetPassword } from "@/lib/auth";
import {
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "@/lib/validations";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if this is a request for password reset or actual reset
    if (body.email) {
      // Request password reset
      const validatedData = requestPasswordResetSchema.parse(body);

      await requestPasswordReset(validatedData.email);

      return NextResponse.json(
        {
          success: true,
          message:
            "Si el correo existe, recibirás un enlace para restablecer tu contraseña",
        },
        { status: 200 }
      );
    } else if (body.password && body.confirmPassword) {
      // Reset password with new password
      const validatedData = resetPasswordSchema.parse(body);

      await resetPassword(validatedData.password);

      return NextResponse.json(
        {
          success: true,
          message: "Contraseña restablecida exitosamente",
        },
        { status: 200 }
      );
    } else {
      return NextResponse.json(
        {
          error: "Datos inválidos",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Password reset error:", error);

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
        error: "Error al procesar la solicitud",
      },
      { status: 500 }
    );
  }
}

