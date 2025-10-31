import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, extractAuthData } from '@/lib/api/permissions';
import { createAdminClient } from '@/lib/supabase/admin';
import { CASE_EVIDENCE_BUCKET } from '@/lib/storage';

/**
 * POST /api/cases/[id]/evidence - Sube archivos de evidencia para un caso
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: caseId } = await params;
    const authResult = await requireAuth();

    if (!authResult.success) {
      return authResult.response;
    }

    const { profile } = extractAuthData(authResult);

    // Check permissions - only DIRECTOR, PROFESOR, ADMIN, SUPER_ADMIN can upload evidence
    if (!['DIRECTOR', 'PROFESOR', 'ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'No tienes permisos para subir evidencia' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: 'No se proporcionaron archivos' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const uploadedFiles = [];

    for (const file of files) {
      // Validate file type
      const validTypes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/pdf',
        'audio/mpeg',
        'audio/mp3',
        'audio/wav',
        'audio/x-m4a',
        'video/mp4',
        'video/quicktime',
        'video/x-msvideo',
      ];

      if (!validTypes.includes(file.type)) {
        continue; // Skip invalid files
      }

      // Validate file size (10MB limit)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        continue; // Skip files that are too large
      }

      // Generate unique filename
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `${caseId}/${profile.id}/${timestamp}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

      // Convert file to buffer
      const fileBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(fileBuffer);

      // Upload to Supabase Storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from(CASE_EVIDENCE_BUCKET)
        .upload(fileName, bytes, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error for file:', file.name, uploadError);
        continue; // Skip failed uploads
      }

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(CASE_EVIDENCE_BUCKET).getPublicUrl(uploadData.path);

      uploadedFiles.push({
        name: file.name,
        url: publicUrl,
        type: file.type,
        size: file.size,
        uploadedAt: new Date().toISOString(),
      });
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json(
        { error: 'No se pudieron subir los archivos. Verifica el tipo y tamaño de los archivos.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        files: uploadedFiles,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading evidence:', error);
    return NextResponse.json(
      { error: 'Error al subir los archivos de evidencia' },
      { status: 500 }
    );
  }
}

