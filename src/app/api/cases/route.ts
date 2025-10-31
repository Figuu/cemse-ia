import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma/client';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { ViolenceType, CaseStatus, CasePriority } from '@prisma/client';
import { logCreate } from '@/lib/audit';

// Validation schema for case creation
const createCaseSchema = z.object({
  incidentDate: z.string(),
  incidentTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  violenceType: z.nativeEnum(ViolenceType),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  location: z.string().min(1, 'La ubicación es requerida'),
  customLocation: z.string().nullable().optional(),
  victimIsAnonymous: z.boolean().default(false),
  victimName: z.string().min(1, 'El nombre de la víctima es requerido'),
  victimAge: z.number().int().positive().optional(),
  victimGrade: z.string().optional(),
  aggressorName: z.string().min(1, 'El nombre del agresor es requerido'),
  aggressorDescription: z.string().optional(),
  relationshipToVictim: z.string().optional(),
  witnesses: z.string().optional(),
  evidenceFiles: z.array(z.object({
    name: z.string(),
    url: z.string(),
    type: z.string(),
    size: z.number(),
    uploadedAt: z.string(),
  })).optional(),
  status: z.nativeEnum(CaseStatus).default('OPEN'),
  priority: z.nativeEnum(CasePriority).default('MEDIUM'),
});

/**
 * GET /api/cases - Lista casos con filtros y paginación
 */
export async function GET(request: NextRequest) {
  try {
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
      include: { school: true },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const violenceType = searchParams.get('violenceType');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const schoolId = searchParams.get('schoolId');

    // Build where clause based on role
    const where: any = {
      isDeleted: false,
    };

    // Role-based filtering
    if (profile.role === 'DIRECTOR' || profile.role === 'PROFESOR') {
      // Directors and professors can only see cases from their school
      if (!profile.schoolId) {
        return NextResponse.json(
          { error: 'No tienes un colegio asignado' },
          { status: 403 }
        );
      }
      where.schoolId = profile.schoolId;
    } else if (profile.role === 'ADMIN') {
      // Admins can filter by school
      if (schoolId) {
        where.schoolId = schoolId;
      }
    } else if (profile.role !== 'SUPER_ADMIN') {
      // Regular users cannot access cases
      return NextResponse.json(
        { error: 'No tienes permisos para ver casos' },
        { status: 403 }
      );
    }

    // Apply filters
    if (search) {
      where.OR = [
        { caseNumber: { contains: search, mode: 'insensitive' } },
        { victimName: { contains: search, mode: 'insensitive' } },
        { aggressorName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (violenceType) {
      where.violenceType = violenceType;
    }

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    // Get total count
    const total = await prisma.case.count({ where });

    // Get cases with pagination
    const cases = await prisma.case.findMany({
      where,
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
      orderBy: {
        createdAt: 'desc',
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      cases,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching cases:', error);
    return NextResponse.json(
      { error: 'Error al obtener los casos' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cases - Crea un nuevo caso
 */
export async function POST(request: NextRequest) {
  try {
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
      include: { school: true },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Perfil no encontrado' },
        { status: 404 }
      );
    }

    // Check permissions - only DIRECTOR and PROFESOR can create cases
    if (!['DIRECTOR', 'PROFESOR', 'ADMIN', 'SUPER_ADMIN'].includes(profile.role)) {
      return NextResponse.json(
        { error: 'No tienes permisos para crear casos' },
        { status: 403 }
      );
    }

    // Directors and professors must have a school assigned
    if ((profile.role === 'DIRECTOR' || profile.role === 'PROFESOR') && !profile.schoolId) {
      return NextResponse.json(
        { error: 'No tienes un colegio asignado' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = createCaseSchema.parse(body);

    // Determine school ID
    let schoolId: string;
    if (profile.role === 'DIRECTOR' || profile.role === 'PROFESOR') {
      schoolId = profile.schoolId!;
    } else {
      // Admin/Super Admin can specify school
      if (!body.schoolId) {
        return NextResponse.json(
          { error: 'Debes especificar un colegio' },
          { status: 400 }
        );
      }
      schoolId = body.schoolId;
    }

    // Generate unique case number (format: CASE-YYYY-NNNN)
    const year = new Date().getFullYear();
    const lastCase = await prisma.case.findFirst({
      where: {
        caseNumber: {
          startsWith: `CASE-${year}-`,
        },
      },
      orderBy: {
        caseNumber: 'desc',
      },
    });

    let caseNumber: string;
    if (lastCase) {
      const lastNumber = parseInt(lastCase.caseNumber.split('-')[2]);
      caseNumber = `CASE-${year}-${String(lastNumber + 1).padStart(4, '0')}`;
    } else {
      caseNumber = `CASE-${year}-0001`;
    }

    // Create case
    const newCase = await prisma.case.create({
      data: {
        caseNumber,
        incidentDate: new Date(validatedData.incidentDate),
        incidentTime: validatedData.incidentTime,
        violenceType: validatedData.violenceType,
        description: validatedData.description,
        location: validatedData.location,
        customLocation: validatedData.customLocation,
        victimIsAnonymous: validatedData.victimIsAnonymous,
        victimName: validatedData.victimName,
        victimAge: validatedData.victimAge,
        victimGrade: validatedData.victimGrade,
        aggressorName: validatedData.aggressorName,
        aggressorDescription: validatedData.aggressorDescription,
        relationshipToVictim: validatedData.relationshipToVictim,
        witnesses: validatedData.witnesses,
        evidenceFiles: validatedData.evidenceFiles || [],
        status: validatedData.status,
        priority: validatedData.priority,
        schoolId,
        createdBy: profile.id,
      },
      include: {
        school: true,
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
    await logCreate(
      'Case',
      newCase.id,
      caseNumber,
      profile.id,
      {
        violenceType: newCase.violenceType,
        schoolId: newCase.schoolId,
        priority: newCase.priority,
      }
    );

    return NextResponse.json(newCase, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Error creating case:', error);
    return NextResponse.json(
      { error: 'Error al crear el caso' },
      { status: 500 }
    );
  }
}
