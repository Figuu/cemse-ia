"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import type { Profile, SchoolType } from "@prisma/client";

// Extended Profile type with school relation
type ProfileWithSchool = Profile & {
  school?: {
    id: string;
    name: string;
    code: string;
    type: SchoolType;
    address: string | null;
    district: string | null;
  } | null;
};

interface AuthContextType {
  user: User | null;
  profile: ProfileWithSchool | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileWithSchool | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createClient();

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/profile");
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfile(null);
    }
  };

  const refreshUser = async () => {
    try {
      setLoading(true);
      const {
        data: { user: currentUser },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        // Silently handle session missing errors
        if (
          error.message?.includes("session") ||
          error.message?.includes("AuthSessionMissingError")
        ) {
          setUser(null);
          setProfile(null);
          return;
        }
        console.error("Error getting user:", error);
        setUser(null);
        setProfile(null);
        return;
      }

      setUser(currentUser);

      if (currentUser) {
        await fetchProfile();
      } else {
        setProfile(null);
      }
    } catch (error) {
      // Silently handle session missing errors
      if (error instanceof Error && error.message?.includes("session")) {
        setUser(null);
        setProfile(null);
        return;
      }
      console.error("Error refreshing user:", error);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial user fetch
    refreshUser();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session) {
        setUser(session.user);
        if (session.user) {
          await fetchProfile();
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [supabase.auth]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      // Redirect to sign-in page
      window.location.href = "/sign-in";
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const value = {
    user,
    profile,
    loading,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
