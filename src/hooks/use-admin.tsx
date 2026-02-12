import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export function useIsAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setIsAdmin(false); setLoading(false); return; }
    supabase.rpc("has_role" as any, { _user_id: user.id, _role: "admin" })
      .then(({ data }) => { setIsAdmin(!!data); setLoading(false); });
  }, [user]);

  return { isAdmin, loading };
}

async function adminFetch(action: string, method = "GET", body?: any, params?: Record<string, string>) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("Not authenticated");

  const url = new URL(`${(import.meta as any).env.VITE_SUPABASE_URL}/functions/v1/admin`);
  url.searchParams.set("action", action);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString(), {
    method,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      "Content-Type": "application/json",
      apikey: (import.meta as any).env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export function useAdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch("users");
      setUsers(data.users || []);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const updatePlan = async (userId: string, plan: string) => {
    await adminFetch("update_plan", "POST", { user_id: userId, plan });
    await fetch();
  };

  return { users, loading, refetch: fetch, updatePlan };
}

export function useAdminAnalytics() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminFetch("analytics").then(d => { setAnalytics(d); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return { analytics, loading };
}

export function useAdminLogs() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(async (limit = 50) => {
    setLoading(true);
    try {
      const data = await adminFetch("logs", "GET", undefined, { limit: String(limit) });
      setLogs(data.events || []);
    } catch { /* silent */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { logs, loading, refetch: fetch };
}
