import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useCredits = () => {
  const [credits, setCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchCredits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setCredits(null);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      setCredits(data?.credits ?? 0);
      
      // Show low credits warning
      if (data?.credits !== null && data.credits <= 10 && data.credits > 0) {
        toast({
          title: "Low Credits",
          description: `You have ${data.credits} credits remaining. Please recharge soon.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching credits:', error);
      setCredits(0);
    } finally {
      setLoading(false);
    }
  };

  const deductCredits = async (amount: number, description: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('deduct-credits', {
        body: { amount, description }
      });

      if (error) throw error;

      if (!data.success) {
        toast({
          title: "Insufficient Credits",
          description: data.error || "You don't have enough credits for this action.",
          variant: "destructive",
        });
        return false;
      }

      setCredits(data.new_balance);

      if (data.low_credits) {
        toast({
          title: "Low Credits Warning",
          description: `You have ${data.new_balance} credits left. Please recharge soon.`,
          variant: "destructive",
        });
      }

      return true;
    } catch (error: any) {
      console.error('Error deducting credits:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to deduct credits",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchCredits();

    // Subscribe to profile changes
    const channel = supabase
      .channel('credits-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
        },
        (payload) => {
          if (payload.new.credits !== undefined) {
            setCredits(payload.new.credits);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { credits, loading, fetchCredits, deductCredits };
};