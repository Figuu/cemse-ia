import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { hasRole, isAdmin, isSuperAdmin, isDirector } from "@/lib/permissions";
import { Role } from "@prisma/client";

/**
 * Result type for permission checks
 */
export interface AuthResult {
  user: { id: string; email: string };
  profile: { id: string; role: Role; authUserId: string; schoolId?: string | null };
}

/**
 * Helper function to check if user is authenticated
 * Returns user and profile if authenticated, or error response if not
 */
export async function requireAuth(): Promise<
  | { success: true; data: AuthResult }
  | { success: false; response: NextResponse }
> {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !currentUser.user || !currentUser.profile) {
      return {
        success: false,
        response: NextResponse.json(
          { error: "No autorizado" },
          { status: 401 }
        ),
      };
    }

    return {
      success: true,
      data: {
        user: {
          id: currentUser.user.id,
          email: currentUser.user.email || "",
        },
        profile: {
          id: currentUser.profile.id,
          role: currentUser.profile.role,
          authUserId: currentUser.profile.authUserId,
          schoolId: currentUser.profile.schoolId,
        },
      },
    };
  } catch (error) {
    console.error("Auth check error:", error);
    return {
      success: false,
      response: NextResponse.json(
        { error: "Error de autenticación" },
        { status: 500 }
      ),
    };
  }
}

/**
 * Check if user has a specific role
 */
export async function requireRole(
  userId: string,
  role: Role
): Promise<{ success: true } | { success: false; response: NextResponse }> {
  const hasRequiredRole = await hasRole(userId, role);

  if (!hasRequiredRole) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      ),
    };
  }

  return { success: true };
}

/**
 * Check if user is admin (ADMIN or SUPER_ADMIN)
 */
export async function requireAdmin(
  userId: string
): Promise<{ success: true } | { success: false; response: NextResponse }> {
  const isAdminUser = await isAdmin(userId);

  if (!isAdminUser) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Solo administradores pueden realizar esta acción" },
        { status: 403 }
      ),
    };
  }

  return { success: true };
}

/**
 * Check if user is admin or director (ADMIN, SUPER_ADMIN, or DIRECTOR)
 */
export async function requireAdminOrDirector(
  userId: string
): Promise<{ success: true } | { success: false; response: NextResponse }> {
  const isAdminUser = await isAdmin(userId);
  const isDirectorUser = await isDirector(userId);

  if (!isAdminUser && !isDirectorUser) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Solo administradores y directores pueden realizar esta acción" },
        { status: 403 }
      ),
    };
  }

  return { success: true };
}

/**
 * Check if user is super admin
 */
export async function requireSuperAdmin(
  userId: string
): Promise<{ success: true } | { success: false; response: NextResponse }> {
  const isSuperAdminUser = await isSuperAdmin(userId);

  if (!isSuperAdminUser) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "Solo super administradores pueden realizar esta acción" },
        { status: 403 }
      ),
    };
  }

  return { success: true };
}

/**
 * Check if user is admin or can modify target user
 */
export async function requireAdminOrSelf(
  userId: string,
  targetUserId: string
): Promise<{ success: true } | { success: false; response: NextResponse }> {
  // Allow if modifying self
  if (userId === targetUserId) {
    return { success: true };
  }

  // Check if user is admin
  const isAdminUser = await isAdmin(userId);

  if (!isAdminUser) {
    return {
      success: false,
      response: NextResponse.json(
        { error: "No tienes permisos para realizar esta acción" },
        { status: 403 }
      ),
    };
  }

  return { success: true };
}

/**
 * Combined function: require auth and role check
 */
export async function requireAuthAndRole(
  role: Role
): Promise<
  | { success: true; data: AuthResult }
  | { success: false; response: NextResponse }
> {
  const authResult = await requireAuth();

  if (!authResult.success) {
    return authResult;
  }

  const roleResult = await requireRole(authResult.data.user.id, role);

  if (!roleResult.success) {
    return roleResult;
  }

  return authResult;
}

/**
 * Combined function: require auth and admin check
 */
export async function requireAuthAndAdmin(): Promise<
  | { success: true; data: AuthResult }
  | { success: false; response: NextResponse }
> {
  const authResult = await requireAuth();

  if (!authResult.success) {
    return authResult;
  }

  const adminResult = await requireAdmin(authResult.data.user.id);

  if (!adminResult.success) {
    return adminResult;
  }

  return authResult;
}

/**
 * Combined function: require auth and super admin check
 */
export async function requireAuthAndSuperAdmin(): Promise<
  | { success: true; data: AuthResult }
  | { success: false; response: NextResponse }
> {
  const authResult = await requireAuth();

  if (!authResult.success) {
    return authResult;
  }

  const superAdminResult = await requireSuperAdmin(authResult.data.user.id);

  if (!superAdminResult.success) {
    return superAdminResult;
  }

  return authResult;
}

/**
 * Combined function: require auth and admin or director check
 */
export async function requireAuthAndAdminOrDirector(): Promise<
  | { success: true; data: AuthResult }
  | { success: false; response: NextResponse }
> {
  const authResult = await requireAuth();

  if (!authResult.success) {
    return authResult;
  }

  const adminOrDirectorResult = await requireAdminOrDirector(authResult.data.user.id);

  if (!adminOrDirectorResult.success) {
    return adminOrDirectorResult;
  }

  return authResult;
}

/**
 * Helper to extract auth data from result
 */
export function extractAuthData(result: { success: true; data: AuthResult }) {
  return result.data;
}

