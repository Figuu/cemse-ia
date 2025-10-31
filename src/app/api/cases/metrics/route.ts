import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { createClient } from "@/lib/supabase/server";
import { ViolenceType, CaseStatus, CasePriority } from "@prisma/client";

/**
 * GET /api/cases/metrics
 * Get case metrics with optional filters
 * Only accessible by ADMIN and SUPER_ADMIN
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Get current user profile
    const profile = await prisma.profile.findUnique({
      where: { authUserId: user.id },
    });

    if (!profile) {
      return NextResponse.json(
        { error: "Perfil no encontrado" },
        { status: 404 }
      );
    }

    // Only admins can access general metrics
    if (profile.role !== "ADMIN" && profile.role !== "SUPER_ADMIN") {
      return NextResponse.json(
        { error: "No tienes permisos para ver estas métricas" },
        { status: 403 }
      );
    }

    // Parse query parameters for filters
    const searchParams = request.nextUrl.searchParams;
    const schoolId = searchParams.get("schoolId");
    const violenceType = searchParams.get("violenceType") as ViolenceType | null;
    const status = searchParams.get("status") as CaseStatus | null;
    const priority = searchParams.get("priority") as CasePriority | null;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    // Build where clause
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {
      isDeleted: false,
    };

    if (schoolId) {
      where.schoolId = schoolId;
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

    if (startDate || endDate) {
      where.incidentDate = {};
      if (startDate) {
        where.incidentDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.incidentDate.lte = new Date(endDate);
      }
    }

    // Get metrics
    const [
      totalCases,
      openCases,
      inProgressCases,
      resolvedCases,
      closedCases,
      archivedCases,
      casesByViolenceType,
      casesByPriority,
      casesByStatus,
      casesBySchool,
      recentCases,
      casesOverTimeRaw,
    ] = await Promise.all([
      // Total cases
      prisma.case.count({ where }),
      // Open cases
      prisma.case.count({
        where: { ...where, status: "OPEN" },
      }),
      // In progress cases
      prisma.case.count({
        where: { ...where, status: "IN_PROGRESS" },
      }),
      // Resolved cases
      prisma.case.count({
        where: { ...where, status: "RESOLVED" },
      }),
      // Closed cases
      prisma.case.count({
        where: { ...where, status: "CLOSED" },
      }),
      // Archived cases
      prisma.case.count({
        where: { ...where, status: "ARCHIVED" },
      }),
      // Cases by violence type
      prisma.case.groupBy({
        by: ["violenceType"],
        where,
        _count: {
          id: true,
        },
      }),
      // Cases by priority
      prisma.case.groupBy({
        by: ["priority"],
        where,
        _count: {
          id: true,
        },
      }),
      // Cases by status
      prisma.case.groupBy({
        by: ["status"],
        where,
        _count: {
          id: true,
        },
      }),
      // Cases by school
      prisma.case.groupBy({
        by: ["schoolId"],
        where,
        _count: {
          id: true,
        },
      }),
      // Recent cases (last 30 days)
      prisma.case.count({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Cases over time (last 12 months)
      prisma.case.findMany({
        where: {
          ...where,
          createdAt: {
            gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          createdAt: true,
        },
      }),
    ]);

    // Get school names for cases by school
    const schoolIds = casesBySchool.map((item) => item.schoolId);
    const schools = await prisma.school.findMany({
      where: {
        id: { in: schoolIds },
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
    });

    const casesBySchoolWithNames = casesBySchool.map((item) => {
      const school = schools.find((s) => s.id === item.schoolId);
      return {
        schoolId: item.schoolId,
        schoolName: school?.name || "Desconocido",
        schoolCode: school?.code || "",
        count: item._count.id,
      };
    });

    // Process cases over time
    const casesOverTimeMap = new Map<string, number>();
    const now = new Date();
    const twelveMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 11, 1);

    // Initialize all months with 0
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      casesOverTimeMap.set(key, 0);
    }

    // Count cases by month
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    casesOverTimeRaw.forEach((caseItem: any) => {
      const date = new Date(caseItem.createdAt);
      if (date >= twelveMonthsAgo) {
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        casesOverTimeMap.set(key, (casesOverTimeMap.get(key) || 0) + 1);
      }
    });

    // Convert to array and format for chart
    const casesOverTimeData = Array.from(casesOverTimeMap.entries()).map(([date, count]) => ({
      date: new Date(date + "-01").toLocaleDateString("es-ES", {
        month: "short",
        year: "numeric",
      }),
      count,
    }));

    return NextResponse.json({
      totalCases,
      openCases,
      inProgressCases,
      resolvedCases,
      closedCases,
      archivedCases,
      recentCases,
      casesByViolenceType: casesByViolenceType.map((item) => ({
        type: item.violenceType,
        count: item._count.id,
      })),
      casesByPriority: casesByPriority.map((item) => ({
        priority: item.priority,
        count: item._count.id,
      })),
      casesByStatus: casesByStatus.map((item) => ({
        status: item.status,
        count: item._count.id,
      })),
      casesBySchool: casesBySchoolWithNames,
      casesOverTime: casesOverTimeData,
    });
  } catch (error) {
    console.error("Error fetching case metrics:", error);
    return NextResponse.json(
      { error: "Error al obtener las métricas" },
      { status: 500 }
    );
  }
}

