import { prisma } from "@/lib/prisma/client";
import { Role } from "@prisma/client";

/**
 * Check if user has a specific role
 */
export async function hasRole(userId: string, role: Role): Promise<boolean> {
  try {
    const profile = await prisma.profile.findUnique({
      where: {
        authUserId: userId,
      },
      select: {
        role: true,
      },
    });

    if (!profile) {
      return false;
    }

    return profile.role === role;
  } catch (error) {
    console.error("Error checking role:", error);
    return false;
  }
}

/**
 * Check if user has admin privileges (ADMIN or SUPER_ADMIN)
 */
export async function isAdmin(userId: string): Promise<boolean> {
  try {
    const profile = await prisma.profile.findUnique({
      where: {
        authUserId: userId,
      },
      select: {
        role: true,
      },
    });

    if (!profile) {
      return false;
    }

    return profile.role === "ADMIN" || profile.role === "SUPER_ADMIN";
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Check if user is a director
 */
export async function isDirector(userId: string): Promise<boolean> {
  try {
    const profile = await prisma.profile.findUnique({
      where: {
        authUserId: userId,
      },
      select: {
        role: true,
      },
    });

    if (!profile) {
      return false;
    }

    return profile.role === "DIRECTOR";
  } catch (error) {
    console.error("Error checking director status:", error);
    return false;
  }
}

/**
 * Check if user has school management privileges (ADMIN, SUPER_ADMIN, or DIRECTOR)
 */
export async function canManageSchool(userId: string, schoolId?: string): Promise<boolean> {
  try {
    const profile = await prisma.profile.findUnique({
      where: {
        authUserId: userId,
      },
      select: {
        role: true,
        schoolId: true,
      },
    });

    if (!profile) {
      return false;
    }

    // Super admins and admins can manage all schools
    if (profile.role === "SUPER_ADMIN" || profile.role === "ADMIN") {
      return true;
    }

    // Directors can only manage their own school
    if (profile.role === "DIRECTOR" && schoolId) {
      return profile.schoolId === schoolId;
    }

    return false;
  } catch (error) {
    console.error("Error checking school management permission:", error);
    return false;
  }
}

/**
 * Check if user is super admin
 */
export async function isSuperAdmin(userId: string): Promise<boolean> {
  try {
    const profile = await prisma.profile.findUnique({
      where: {
        authUserId: userId,
      },
      select: {
        role: true,
      },
    });

    if (!profile) {
      return false;
    }

    return profile.role === "SUPER_ADMIN";
  } catch (error) {
    console.error("Error checking super admin status:", error);
    return false;
  }
}

/**
 * Check if user has permission to access a resource based on role hierarchy
 */
export async function canAccessResource(
  userId: string,
  requiredRole: Role
): Promise<boolean> {
  try {
    const profile = await prisma.profile.findUnique({
      where: {
        authUserId: userId,
      },
      select: {
        role: true,
      },
    });

    if (!profile) {
      return false;
    }

    // Define role hierarchy
    const roleHierarchy: Record<Role, number> = {
      USER: 1,
      PROFESOR: 2,
      DIRECTOR: 3,
      ADMIN: 4,
      SUPER_ADMIN: 5,
    };

    const userRoleLevel = roleHierarchy[profile.role];
    const requiredRoleLevel = roleHierarchy[requiredRole];

    return userRoleLevel >= requiredRoleLevel;
  } catch (error) {
    console.error("Error checking access permission:", error);
    return false;
  }
}

/**
 * Check if user can modify another user based on role hierarchy
 */
export async function canModifyUser(
  currentUserId: string,
  targetUserId: string
): Promise<boolean> {
  try {
    const [currentUser, targetUser] = await Promise.all([
      prisma.profile.findUnique({
        where: { authUserId: currentUserId },
        select: { role: true, schoolId: true },
      }),
      prisma.profile.findUnique({
        where: { authUserId: targetUserId },
        select: { role: true, schoolId: true },
      }),
    ]);

    if (!currentUser || !targetUser) {
      return false;
    }

    // Super Admin can modify anyone
    if (currentUser.role === "SUPER_ADMIN") {
      return true;
    }

    // Admin can modify DIRECTOR, PROFESOR, and USER roles
    if (currentUser.role === "ADMIN") {
      return ["DIRECTOR", "PROFESOR", "USER"].includes(targetUser.role);
    }

    // Director can modify PROFESOR in their school only
    if (currentUser.role === "DIRECTOR") {
      return (
        targetUser.role === "PROFESOR" &&
        currentUser.schoolId === targetUser.schoolId &&
        currentUser.schoolId !== null
      );
    }

    // Users can only modify themselves
    return currentUserId === targetUserId;
  } catch (error) {
    console.error("Error checking modify permission:", error);
    return false;
  }
}

/**
 * Check if user can create users with a specific role
 */
export async function canCreateUserWithRole(
  currentUserId: string,
  targetRole: Role
): Promise<boolean> {
  try {
    const currentUser = await prisma.profile.findUnique({
      where: { authUserId: currentUserId },
      select: { role: true },
    });

    if (!currentUser) {
      return false;
    }

    // Super Admin can create any role
    if (currentUser.role === "SUPER_ADMIN") {
      return true;
    }

    // Admin can create DIRECTOR, PROFESOR, and USER roles
    if (currentUser.role === "ADMIN") {
      return ["DIRECTOR", "PROFESOR", "USER"].includes(targetRole);
    }

    // Director can only create PROFESOR role
    if (currentUser.role === "DIRECTOR" && targetRole === "PROFESOR") {
      return true;
    }

    // Other users cannot create any users
    return false;
  } catch (error) {
    console.error("Error checking create user permission:", error);
    return false;
  }
}

/**
 * Get user role
 */
export async function getUserRole(userId: string): Promise<Role | null> {
  try {
    const profile = await prisma.profile.findUnique({
      where: {
        authUserId: userId,
      },
      select: {
        role: true,
      },
    });

    return profile?.role || null;
  } catch (error) {
    console.error("Error getting user role:", error);
    return null;
  }
}

/**
 * Check if user is forcing password change
 */
export async function requiresPasswordChange(userId: string): Promise<boolean> {
  try {
    const profile = await prisma.profile.findUnique({
      where: {
        authUserId: userId,
      },
      select: {
        forcePasswordChange: true,
      },
    });

    return profile?.forcePasswordChange || false;
  } catch (error) {
    console.error("Error checking password change requirement:", error);
    return false;
  }
}

