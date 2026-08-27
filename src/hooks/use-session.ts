"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";
import type { User } from "@supabase/supabase-js";

interface SessionData {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
}

export function useSession(): SessionData {
  const [session, setSession] = useState<SessionData>({
    user: null,
    profile: null,
    loading: true,
  });

  const fetchSession = useCallback(async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setSession({ user: null, profile: null, loading: false });
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select(`
          *,
          college:colleges(*),
          course:courses(*),
          branch:branches(*),
          academic_year:academic_years(*),
          semester:semesters(*),
          division:divisions(*)
        `)
        .eq("id", user.id)
        .single();

      setSession({
        user,
        profile: profile || null,
        loading: false,
      });
    } catch (error) {
      console.error("Session fetch error:", error);
      setSession({ user: null, profile: null, loading: false });
    }
  }, []);

  useEffect(() => {
    fetchSession();

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchSession();
      } else {
        setSession({ user: null, profile: null, loading: false });
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchSession]);

  return session;
}