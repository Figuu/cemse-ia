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
      ADMIN: 2,
      SUPER_ADMIN: 3,
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
        select: { role: true },
      }),
      prisma.profile.findUnique({
        where: { authUserId: targetUserId },
        select: { role: true },
      }),
    ]);

    if (!currentUser || !targetUser) {
      return false;
    }

    // Super Admin can modify anyone
    if (currentUser.role === "SUPER_ADMIN") {
      return true;
    }

    // Admin can modify regular users only
    if (currentUser.role === "ADMIN" && targetUser.role === "USER") {
      return true;
    }

    // Regular users can only modify themselves
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

    // Admin can only create USER role
    if (currentUser.role === "ADMIN" && targetRole === "USER") {
      return true;
    }

    // Regular users cannot create any users
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

