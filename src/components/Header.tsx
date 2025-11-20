import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Smartphone, Upload } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { CreditsDisplay } from '@/components/CreditsDisplay';

interface HeaderProps {
  showAuth?: boolean;
  showDashboard?: boolean;
  onPublishClick?: () => void;
  showPublish?: boolean;
}

export const Header = ({ showAuth = true, showDashboard = true, onPublishClick, showPublish = false }: HeaderProps) => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate('/')}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow">
              <Smartphone className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">AppDev</h1>
          </button>
          <div className="flex items-center gap-3">
            {showPublish && onPublishClick && (
              <Button onClick={onPublishClick} className="gradient-primary">
                <Upload className="mr-2 h-4 w-4" />
                Publish
              </Button>
            )}
            {user ? (
              <>
                <CreditsDisplay />
                {showDashboard && (
                  <Button onClick={() => navigate('/dashboard')} variant="outline">
                    Dashboard
                  </Button>
                )}
                <Button onClick={() => navigate('/profile')} variant="ghost">
                  Profile
                </Button>
              </>
            ) : (
              showAuth && (
                <Button onClick={() => navigate('/auth')} variant="outline">
                  Sign In
                </Button>
              )
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
