import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { ViolenceType, CaseStatus, CasePriority } from '@prisma/client';
import { logUpdate, logDelete, logCaseStatusChange } from '@/lib/audit';

// Validation schema for case update
const updateCaseSchema = z.object({
  incidentDate: z.string().optional(),
  incidentTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)').optional(),
  violenceType: z.nativeEnum(ViolenceType).optional(),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres').optional(),
  location: z.string().min(1, 'La ubicación es requerida').optional(),
  customLocation: z.string().optional().nullable(),
  victimIsAnonymous: z.boolean().optional(),
  victimName: z.string().min(1, 'El nombre de la víctima es requerido').optional(),
  victimAge: z.number().int().positive().optional().nullable(),
  victimGrade: z.string().optional().nullable(),
  aggressorName: z.string().min(1, 'El nombre del agresor es requerido').optional(),
  aggressorDescription: z.string().optional().nullable(),
  relationshipToVictim: z.string().optional().nullable(),
  witnesses: z.string().optional().nullable(),
  evidenceFiles: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number(),
    uploadedAt: z.string(),
  })).optional(),
  status: z.nativeEnum(CaseStatus).optional(),
  priority: z.nativeEnum(CasePriority).optional(),
});

/**
 * GET /api/cases/[id] - Obtiene un caso específico
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Get current user profile
    const profile = await prisma.profile.findUnique({
      where: { authUserId: user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    // Get case
    const caseData = await prisma.case.findUnique({
      where: { id },
      include: {
        school: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!caseData) {
      return NextResponse.json(
        { error: 'Caso no encontrado' },
        { status: 404 }
      );
    }

    if (caseData.isDeleted) {
      return NextResponse.json(
        { error: 'Caso no encontrado' },
        { status: 404 }
      );
    }

    // Check permissions
    if (profile.role === 'DIRECTOR' || profile.role === 'PROFESOR') {
      if (caseData.schoolId !== profile.schoolId) {
        return NextResponse.json(
          { error: 'No tienes permisos para ver este caso' },
          { status: 403 }
        );
      }
    } else if (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para ver casos' },
        { status: 403 }
      );
    }

    return NextResponse.json(caseData);
  } catch (error) {
    console.error('Error fetching case:', error);
    return NextResponse.json(
      { error: 'Error al obtener el caso' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/cases/[id] - Actualiza un caso
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Get current user profile
    const profile = await prisma.profile.findUnique({
      where: { authUserId: user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    // Get existing case
    const existingCase = await prisma.case.findUnique({
      where: { id },
    });

    if (!existingCase || existingCase.isDeleted) {
      return NextResponse.json(
        { error: 'Caso no encontrado' },
        { status: 404 }
      );
    }

    // Check permissions
    if (profile.role === 'DIRECTOR' || profile.role === 'PROFESOR') {
      if (existingCase.schoolId !== profile.schoolId) {
        return NextResponse.json(
          { error: 'No tienes permisos para editar este caso' },
          { status: 403 }
        );
      }
    } else if (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para editar casos' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateCaseSchema.parse(body);

    // Track changes for audit log
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const changes: Record<string, any> = {};
    Object.keys(validatedData).forEach(key => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const newValue = (validatedData as any)[key];
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const oldValue = (existingCase as any)[key];
      if (newValue !== undefined && JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
        changes[key] = { from: oldValue, to: newValue };
      }
    });

    // Prepare update data
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const updateData: any = {};
    if (validatedData.incidentDate) {
      updateData.incidentDate = new Date(validatedData.incidentDate);
    }
    if (validatedData.incidentTime !== undefined) updateData.incidentTime = validatedData.incidentTime;
    if (validatedData.violenceType !== undefined) updateData.violenceType = validatedData.violenceType;
    if (validatedData.description !== undefined) updateData.description = validatedData.description;
    if (validatedData.location !== undefined) updateData.location = validatedData.location;
    if (validatedData.customLocation !== undefined) updateData.customLocation = validatedData.customLocation;
    if (validatedData.victimIsAnonymous !== undefined) updateData.victimIsAnonymous = validatedData.victimIsAnonymous;
    if (validatedData.victimName !== undefined) updateData.victimName = validatedData.victimName;
    if (validatedData.victimAge !== undefined) updateData.victimAge = validatedData.victimAge;
    if (validatedData.victimGrade !== undefined) updateData.victimGrade = validatedData.victimGrade;
    if (validatedData.aggressorName !== undefined) updateData.aggressorName = validatedData.aggressorName;
    if (validatedData.aggressorDescription !== undefined) updateData.aggressorDescription = validatedData.aggressorDescription;
    if (validatedData.relationshipToVictim !== undefined) updateData.relationshipToVictim = validatedData.relationshipToVictim;
    if (validatedData.witnesses !== undefined) updateData.witnesses = validatedData.witnesses;
    if (validatedData.evidenceFiles !== undefined) updateData.evidenceFiles = validatedData.evidenceFiles;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;
    if (validatedData.priority !== undefined) updateData.priority = validatedData.priority;

    // Update case
    const updatedCase = await prisma.case.update({
      where: { id },
      data: updateData,
      include: {
        school: {
          select: {
            id: true,
            name: true,
            code: true,
            type: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Create audit log
    if (Object.keys(changes).length > 0) {
      await logUpdate(
        'Case',
        updatedCase.id,
        updatedCase.caseNumber,
        profile.id,
        changes
      );

      // Special log for status changes
      if (validatedData.status && validatedData.status !== existingCase.status) {
        await logCaseStatusChange(
          updatedCase.id,
          updatedCase.caseNumber,
          profile.id,
          existingCase.status,
          validatedData.status
        );
      }
    }

    return NextResponse.json(updatedCase);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error updating case:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el caso' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cases/[id] - Elimina (soft delete) un caso
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Get current user profile
    const profile = await prisma.profile.findUnique({
      where: { authUserId: user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    // Get case
    const caseData = await prisma.case.findUnique({
      where: { id },
    });

    if (!caseData || caseData.isDeleted) {
      return NextResponse.json(
        { error: 'Caso no encontrado' },
        { status: 404 }
      );
    }

    // Check permissions - only admins can delete cases
    if (profile.role !== 'ADMIN' && profile.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar casos' },
        { status: 403 }
      );
    }

    // Soft delete
    await prisma.case.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        deletedBy: profile.id,
      },
    });

    // Create audit log
    await logDelete(
      'Case',
      caseData.id,
      caseData.caseNumber,
      profile.id
    );

    return NextResponse.json({ message: 'Caso eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting case:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el caso' },
      { status: 500 }
    );
  }
}
