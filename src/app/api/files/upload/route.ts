import { NextRequest, NextResponse } from "next/server";
import { requireAuth, extractAuthData } from "@/lib/api/permissions";
import { createAdminClient } from "@/lib/supabase/admin";
import { prisma } from "@/lib/prisma/client";

export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAuth();

    if (!authResult.success) {
      return authResult.response;
    }

    const { user } = extractAuthData(authResult);

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        {
          error: "No se proporcionó ningún archivo",
        },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: "Tipo de archivo no permitido. Solo se permiten imágenes.",
        },
        { status: 400 }
      );
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: "El archivo es demasiado grande. El límite es 5MB.",
        },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split(".").pop();
    const fileName = `${user.id}_${timestamp}_${randomString}.${fileExtension}`;

    // Upload to Supabase Storage
    const supabase = createAdminClient();
    const fileBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(fileBuffer);

    const { error: uploadError } = await supabase.storage
      .from("user-profile-pictures")
      .upload(fileName, bytes, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return NextResponse.json(
        {
          error: "Error al subir el archivo",
        },
        { status: 500 }
      );
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("user-profile-pictures").getPublicUrl(fileName);

    // Update user profile with new picture URL
    const updatedProfile = await prisma.profile.update({
      where: {
        authUserId: user.id,
      },
      data: {
        pfpUrl: publicUrl,
      },
      select: {
        id: true,
        email: true,
        name: true,
        pfpUrl: true,
        role: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Archivo subido exitosamente",
        file: {
          name: fileName,
          url: publicUrl,
        },
        profile: updatedProfile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("File upload error:", error);

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
        error: "Error al subir el archivo",
      },
      { status: 500 }
    );
  }
}
