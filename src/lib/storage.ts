import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Create Supabase client for storage operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const CASE_EVIDENCE_BUCKET = 'case-evidence';

export interface UploadedFile {
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedAt: string;
}

/**
 * Sube un archivo de evidencia al bucket de Supabase
 *
 * @param file - Archivo a subir
 * @param caseId - ID del caso al que pertenece la evidencia
 * @param userId - ID del usuario que sube el archivo
 * @returns Información del archivo subido
 */
export async function uploadCaseEvidence(
  file: File,
  caseId: string,
  userId: string
): Promise<UploadedFile> {
  try {
    // Generate unique filename with timestamp
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${caseId}/${userId}/${timestamp}.${fileExt}`;

    // Upload file to Supabase storage
    const { data, error } = await supabase.storage
      .from(CASE_EVIDENCE_BUCKET)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      throw new Error(`Error al subir archivo: ${error.message}`);
    }

    // Get public URL for the file
    const { data: urlData } = supabase.storage
      .from(CASE_EVIDENCE_BUCKET)
      .getPublicUrl(data.path);

    return {
      name: file.name,
      url: urlData.publicUrl,
      type: file.type,
      size: file.size,
      uploadedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}

/**
 * Sube múltiples archivos de evidencia
 *
 * @param files - Array de archivos a subir
 * @param caseId - ID del caso al que pertenece la evidencia
 * @param userId - ID del usuario que sube los archivos
 * @returns Array con información de los archivos subidos
 */
export async function uploadMultipleCaseEvidence(
  files: File[],
  caseId: string,
  userId: string
): Promise<UploadedFile[]> {
  const uploadPromises = files.map(file =>
    uploadCaseEvidence(file, caseId, userId)
  );

  try {
    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw error;
  }
}

/**
 * Elimina un archivo de evidencia del bucket
 *
 * @param fileUrl - URL del archivo a eliminar
 * @returns True si se eliminó correctamente
 */
export async function deleteCaseEvidence(fileUrl: string): Promise<boolean> {
  try {
    // Extract file path from URL
    const url = new URL(fileUrl);
    const pathParts = url.pathname.split(`/${CASE_EVIDENCE_BUCKET}/`);
    if (pathParts.length < 2) {
      throw new Error('URL de archivo inválida');
    }
    const filePath = pathParts[1];

    const { error } = await supabase.storage
      .from(CASE_EVIDENCE_BUCKET)
      .remove([filePath]);

    if (error) {
      throw new Error(`Error al eliminar archivo: ${error.message}`);
    }

    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
}

/**
 * Elimina múltiples archivos de evidencia
 *
 * @param fileUrls - Array de URLs de archivos a eliminar
 * @returns True si todos se eliminaron correctamente
 */
export async function deleteMultipleCaseEvidence(
  fileUrls: string[]
): Promise<boolean> {
  const deletePromises = fileUrls.map(url => deleteCaseEvidence(url));

  try {
    await Promise.all(deletePromises);
    return true;
  } catch (error) {
    console.error('Error deleting multiple files:', error);
    throw error;
  }
}

/**
 * Valida que un archivo sea del tipo permitido para evidencia
 *
 * Tipos permitidos:
 * - Imágenes: jpg, jpeg, png, gif, webp
 * - Documentos: pdf
 * - Audio: mp3, wav, m4a
 * - Video: mp4, mov, avi
 */
export function isValidEvidenceFileType(file: File): boolean {
  const validTypes = [
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    // Documents
    'application/pdf',
    // Audio
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/x-m4a',
    // Video
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
  ];

  return validTypes.includes(file.type);
}

/**
 * Valida el tamaño del archivo (máximo 10MB)
 */
export function isValidEvidenceFileSize(file: File): boolean {
  const maxSizeInBytes = 10 * 1024 * 1024; // 10MB
  return file.size <= maxSizeInBytes;
}

/**
 * Valida un archivo de evidencia (tipo y tamaño)
 */
export function validateEvidenceFile(file: File): {
  valid: boolean;
  error?: string;
} {
  if (!isValidEvidenceFileType(file)) {
    return {
      valid: false,
      error: 'Tipo de archivo no permitido. Tipos válidos: imágenes (jpg, png, gif, webp), PDF, audio (mp3, wav, m4a), video (mp4, mov, avi)',
    };
  }

  if (!isValidEvidenceFileSize(file)) {
    return {
      valid: false,
      error: 'El archivo excede el tamaño máximo permitido de 10MB',
    };
  }

  return { valid: true };
}

/**
 * Formatea el tamaño de archivo en formato legible
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Obtiene el ícono apropiado para el tipo de archivo
 */
export function getFileIcon(fileType: string): string {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType.startsWith('video/')) return '🎥';
  if (fileType.startsWith('audio/')) return '🎵';
  if (fileType === 'application/pdf') return '📄';
  return '📎';
}
