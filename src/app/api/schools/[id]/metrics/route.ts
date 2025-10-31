import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getSession } from "@/lib/auth";
import { canViewSchool } from "@/lib/permissions";

/**
 * GET /api/schools/[id]/metrics
 * Get case metrics for a specific school
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check if user can view this school
    const canAccess = await canViewSchool(session.user.id, id);

    if (!canAccess) {
      return NextResponse.json(
        { error: "No tienes permiso para ver este colegio" },
        { status: 403 }
      );
    }

    // Verify school exists
    const school = await prisma.school.findUnique({
      where: { id },
      select: { id: true, isDeleted: true },
    });

    if (!school || school.isDeleted) {
      return NextResponse.json(
        { error: "Colegio no encontrado" },
        { status: 404 }
      );
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
      recentCases,
      casesOverTime,
    ] = await Promise.all([
      // Total cases
      prisma.case.count({
        where: {
          schoolId: id,
          isDeleted: false,
        },
      }),
      // Open cases
      prisma.case.count({
        where: {
          schoolId: id,
          isDeleted: false,
          status: "OPEN",
        },
      }),
      // In progress cases
      prisma.case.count({
        where: {
          schoolId: id,
          isDeleted: false,
          status: "IN_PROGRESS",
        },
      }),
      // Resolved cases
      prisma.case.count({
        where: {
          schoolId: id,
          isDeleted: false,
          status: "RESOLVED",
        },
      }),
      // Closed cases
      prisma.case.count({
        where: {
          schoolId: id,
          isDeleted: false,
          status: "CLOSED",
        },
      }),
      // Archived cases
      prisma.case.count({
        where: {
          schoolId: id,
          isDeleted: false,
          status: "ARCHIVED",
        },
      }),
      // Cases by violence type
      prisma.case.groupBy({
        by: ["violenceType"],
        where: {
          schoolId: id,
          isDeleted: false,
        },
        _count: {
          id: true,
        },
      }),
      // Cases by priority
      prisma.case.groupBy({
        by: ["priority"],
        where: {
          schoolId: id,
          isDeleted: false,
        },
        _count: {
          id: true,
        },
      }),
      // Cases by status
      prisma.case.groupBy({
        by: ["status"],
        where: {
          schoolId: id,
          isDeleted: false,
        },
        _count: {
          id: true,
        },
      }),
      // Recent cases (last 30 days)
      prisma.case.count({
        where: {
          schoolId: id,
          isDeleted: false,
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
      }),
      // Cases over time (last 12 months)
      prisma.case.findMany({
        where: {
          schoolId: id,
          isDeleted: false,
          createdAt: {
            gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          },
        },
        select: {
          createdAt: true,
        },
      }),
    ]);

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
    casesOverTime.forEach((caseItem) => {
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
      casesOverTime: casesOverTimeData,
    });
  } catch (error) {
    console.error("Error fetching school metrics:", error);
    return NextResponse.json(
      {
        error: "Error al obtener las métricas",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

