import { Coins } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useCredits } from "@/hooks/useCredits";
import { Skeleton } from "@/components/ui/skeleton";

export const CreditsDisplay = () => {
  const navigate = useNavigate();
  const { credits, loading } = useCredits();

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  const isLowCredits = credits !== null && credits <= 10;

  return (
    <div className="flex items-center gap-2">
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${
        isLowCredits ? 'bg-destructive/10 border-destructive' : 'bg-secondary'
      }`}>
        <Coins className={`w-4 h-4 ${isLowCredits ? 'text-destructive' : 'text-primary'}`} />
        <span className={`font-semibold ${isLowCredits ? 'text-destructive' : 'text-foreground'}`}>
          {credits ?? 0} Credits
        </span>
      </div>
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => navigate('/pricing')}
      >
        Buy More
      </Button>
    </div>
  );
};