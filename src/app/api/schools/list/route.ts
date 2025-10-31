import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma/client";
import { getSession } from "@/lib/auth";
import { isDirector } from "@/lib/permissions";

/**
 * GET /api/schools/list
 * Get simplified list of schools for dropdowns
 * Returns only id, name, and code
 */
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "No autenticado" },
        { status: 401 }
      );
    }

    // Check if user is director
    const userIsDirector = await isDirector(session.user.id);

    let schools;

    if (userIsDirector) {
      // Directors can only see their school
      const profile = await prisma.profile.findUnique({
        where: { authUserId: session.user.id },
        select: { schoolId: true, school: true },
      });

      if (!profile?.school) {
        return NextResponse.json([]);
      }

      schools = [
        {
          id: profile.school.id,
          name: profile.school.name,
          code: profile.school.code,
          type: profile.school.type,
        },
      ];
    } else {
      // Admins and super admins can see all schools
      schools = await prisma.school.findMany({
        select: {
          id: true,
          name: true,
          code: true,
          type: true,
        },
        orderBy: { name: "asc" },
      });
    }

    return NextResponse.json(schools);
  } catch (error) {
    console.error("Error fetching schools list:", error);
    return NextResponse.json(
      { error: "Error al obtener la lista de colegios" },
      { status: 500 }
    );
  }
}
