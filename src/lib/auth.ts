import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma/client";

interface SignUpParams {
  email: string;
  password: string;
  name: string;
  phone?: string;
  department?: string;
}

interface SignInParams {
  email: string;
  password: string;
}

/**
 * Register a new user with default USER role
 */
export async function signUp(params: SignUpParams) {
  const supabase = await createClient();

  try {
    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          name: params.name,
          phone: params.phone,
          department: params.department,
        },
      },
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user) {
      throw new Error("No user data returned from Supabase Auth");
    }

    // Create profile in database
    const profile = await prisma.profile.create({
      data: {
        authUserId: authData.user.id,
        email: params.email,
        name: params.name,
        phone: params.phone,
        department: params.department,
        role: "USER",
        forcePasswordChange: false,
      },
    });

    return {
      success: true,
      user: authData.user,
      profile: profile,
    };
  } catch (error) {
    console.error("Sign up error:", error);
    throw error;
  }
}

/**
 * Sign in existing user
 */
export async function signIn(params: SignInParams) {
  const supabase = await createClient();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: params.email,
      password: params.password,
    });

    if (error) {
      throw new Error(error.message);
    }

    if (!data.user || !data.session) {
      throw new Error("Failed to create session");
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
    };
  } catch (error) {
    console.error("Sign in error:", error);
    throw error;
  }
}

/**
 * Sign out current user
 */
export async function signOut() {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Sign out error:", error);
    throw error;
  }
}

/**
 * Get current authenticated user
 */
export async function getCurrentUser() {
  const supabase = await createClient();

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error) {
      // If it's an auth session missing error, return null instead of throwing
      if (
        error.message?.includes("session") ||
        error.message?.includes("AuthSessionMissingError")
      ) {
        return null;
      }
      throw new Error(error.message);
    }

    if (!user) {
      return null;
    }

    // Get profile from database
    const profile = await prisma.profile.findUnique({
      where: {
        authUserId: user.id,
      },
    });

    return {
      user,
      profile,
    };
  } catch (error) {
    // Silently handle session missing errors
    if (error instanceof Error && error.message?.includes("session")) {
      return null;
    }
    console.error("Get current user error:", error);
    throw error;
  }
}

/**
 * Get current session
 */
export async function getSession() {
  const supabase = await createClient();

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error) {
      throw new Error(error.message);
    }

    return session;
  } catch (error) {
    console.error("Get session error:", error);
    throw error;
  }
}

/**
 * Request password reset
 */
export async function requestPasswordReset(email: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Password reset request error:", error);
    throw error;
  }
}

/**
 * Reset password with token
 */
export async function resetPassword(newPassword: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Password reset error:", error);
    throw error;
  }
}

/**
 * Update user password (for logged in users)
 */
export async function updatePassword(newPassword: string) {
  const supabase = await createClient();

  try {
    // First, verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("User not authenticated");
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Update password error:", error);
    throw error;
  }
}

/**
 * Verify email
 */
export async function verifyEmail(token: string) {
  const supabase = await createClient();

  try {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "email",
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Email verification error:", error);
    throw error;
  }
}
