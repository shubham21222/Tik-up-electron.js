import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";

export interface Goal {
  id: string;
  user_id: string;
  screen_id: string | null;
  public_token: string;
  goal_type: string;
  title: string;
  target_value: number;
  current_value: number;
  is_active: boolean;
  style_preset: string;
  on_complete_action: string | null;
  auto_reset: boolean;
  milestone_alerts: boolean;
  custom_config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export const useGoals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("goals" as any)
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching goals:", error);
    } else {
      setGoals((data || []) as unknown as Goal[]);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  // Realtime subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("goals-realtime")
      .on(
        "postgres_changes" as any,
        { event: "*", schema: "public", table: "goals", filter: `user_id=eq.${user.id}` },
        () => fetchGoals()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, fetchGoals]);

  const createGoal = async (goalType: string, title: string, targetValue: number) => {
    if (!user) return null;
    const { data, error } = await supabase
      .from("goals" as any)
      .insert({ user_id: user.id, goal_type: goalType, title, target_value: targetValue } as any)
      .select()
      .single();

    if (error) {
      toast.error("Failed to create goal");
      console.error(error);
      return null;
    }
    toast.success("Goal created!");
    return data as unknown as Goal;
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    const { error } = await supabase
      .from("goals" as any)
      .update(updates as any)
      .eq("id", id);

    if (error) {
      toast.error("Failed to update goal");
      console.error(error);
    }
  };

  const deleteGoal = async (id: string) => {
    const { error } = await supabase
      .from("goals" as any)
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Failed to delete goal");
      console.error(error);
    } else {
      toast.success("Goal deleted");
    }
  };

  const simulateGoal = async (goalId: string, increment: number = 1) => {
    if (!user) return;
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const newValue = Math.min(goal.current_value + increment, goal.target_value);
    await supabase
      .from("goals" as any)
      .update({ current_value: newValue } as any)
      .eq("id", goalId);

    // Broadcast to overlay
    const channel = supabase.channel(`goal-${goal.public_token}`);
    await channel.send({
      type: "broadcast",
      event: "goal_update",
      payload: { goal_id: goalId, current_value: newValue, target_value: goal.target_value },
    });

    if (newValue >= goal.target_value) {
      await channel.send({
        type: "broadcast",
        event: "goal_complete",
        payload: { goal_id: goalId, title: goal.title },
      });
    }
  };

  const resetGoal = async (goalId: string) => {
    await supabase
      .from("goals" as any)
      .update({ current_value: 0 } as any)
      .eq("id", goalId);

    const goal = goals.find(g => g.id === goalId);
    if (goal) {
      const channel = supabase.channel(`goal-${goal.public_token}`);
      await channel.send({
        type: "broadcast",
        event: "reset_goal",
        payload: { goal_id: goalId },
      });
    }
    toast.success("Goal reset");
  };

  return { goals, loading, createGoal, updateGoal, deleteGoal, simulateGoal, resetGoal, refetch: fetchGoals };
};
