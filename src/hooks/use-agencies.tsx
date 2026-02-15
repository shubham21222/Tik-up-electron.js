import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface Agency {
  id: string;
  name: string;
  slug: string;
  plan: "starter" | "pro" | "enterprise";
  brand_config: Record<string, any>;
  custom_domain: string | null;
  max_clients: number;
  max_overlays: number;
  max_ws_connections: number;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AgencyMember {
  id: string;
  agency_id: string;
  user_id: string;
  role: "owner" | "admin" | "designer";
  created_at: string;
}

export function useAgencies() {
  const { user } = useAuth();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAgencies = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    const { data, error } = await supabase
      .from("agencies" as any)
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setAgencies(data as unknown as Agency[]);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchAgencies(); }, [fetchAgencies]);

  const createAgency = async (name: string, slug: string, plan: Agency["plan"] = "starter") => {
    if (!user) return null;
    // Create agency
    const { data: agency, error } = await supabase
      .from("agencies" as any)
      .insert({ name, slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, "-"), plan, created_by: user.id } as any)
      .select()
      .single();
    if (error) { toast.error(error.message || "Failed to create agency"); return null; }
    const created = agency as unknown as Agency;

    // Auto-add creator as owner
    await supabase
      .from("agency_members" as any)
      .insert({ agency_id: created.id, user_id: user.id, role: "owner" } as any);

    setAgencies(prev => [created, ...prev]);
    toast.success("Agency created!");
    return created;
  };

  const updateAgency = async (id: string, updates: Partial<Pick<Agency, "name" | "plan" | "brand_config" | "custom_domain" | "is_active">>) => {
    const { error } = await supabase
      .from("agencies" as any)
      .update(updates as any)
      .eq("id", id);
    if (error) { toast.error("Failed to update agency"); return; }
    setAgencies(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    toast.success("Agency updated!");
  };

  const deleteAgency = async (id: string) => {
    const { error } = await supabase.from("agencies" as any).delete().eq("id", id);
    if (error) { toast.error("Failed to delete agency"); return; }
    setAgencies(prev => prev.filter(a => a.id !== id));
    toast.success("Agency deleted!");
  };

  return { agencies, loading, createAgency, updateAgency, deleteAgency, refetch: fetchAgencies };
}

export function useAgencyMembers(agencyId: string | null) {
  const [members, setMembers] = useState<AgencyMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMembers = useCallback(async () => {
    if (!agencyId) { setLoading(false); return; }
    const { data, error } = await supabase
      .from("agency_members" as any)
      .select("*")
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: true });
    if (!error && data) setMembers(data as unknown as AgencyMember[]);
    setLoading(false);
  }, [agencyId]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const addMember = async (userId: string, role: AgencyMember["role"] = "admin") => {
    if (!agencyId) return;
    const { error } = await supabase
      .from("agency_members" as any)
      .insert({ agency_id: agencyId, user_id: userId, role } as any);
    if (error) { toast.error("Failed to add member"); return; }
    fetchMembers();
    toast.success("Member added!");
  };

  const updateRole = async (memberId: string, role: AgencyMember["role"]) => {
    const { error } = await supabase
      .from("agency_members" as any)
      .update({ role } as any)
      .eq("id", memberId);
    if (error) { toast.error("Failed to update role"); return; }
    setMembers(prev => prev.map(m => m.id === memberId ? { ...m, role } : m));
    toast.success("Role updated!");
  };

  const removeMember = async (memberId: string) => {
    const { error } = await supabase.from("agency_members" as any).delete().eq("id", memberId);
    if (error) { toast.error("Failed to remove member"); return; }
    setMembers(prev => prev.filter(m => m.id !== memberId));
    toast.success("Member removed!");
  };

  return { members, loading, addMember, updateRole, removeMember, refetch: fetchMembers };
}
