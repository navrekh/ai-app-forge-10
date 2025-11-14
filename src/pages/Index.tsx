import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Smartphone, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PhoneMockup } from '@/components/PhoneMockup';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { api } from '@/utils/api';

interface BuildStatusResponse {
  status: 'planning' | 'generating' | 'building' | 'packaging' | 'completed' | 'failed';
  progress: number;
  downloadUrl?: string;
  error?: string;
}

const STATUS_EMOJI = {
  planning: '🧠',
  generating: '🏗️',
  building: '⚙️',
  packaging: '📦',
  completed: '✅',
  failed: '❌'
};

const STATUS_LABELS = {
  planning: 'Planning your app',
  generating: 'Generating screens',
  building: 'Building components',
  packaging: 'Finalizing',
  completed: 'Complete!',
  failed: 'Failed'
};

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [appIdea, setAppIdea] = useState('');
  const [buildId, setBuildId] = useState<string | null>(null);
  const [buildStatus, setBuildStatus] = useState<BuildStatusResponse | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Poll build status
  useEffect(() => {
    if (!buildId || buildStatus?.status === 'completed' || buildStatus?.status === 'failed') {
      return;
    }

    const pollStatus = async () => {
      try {
        const { data } = await api.get<BuildStatusResponse>(`/api/build-status/${buildId}`);
        setBuildStatus(data);
        
        const emoji = STATUS_EMOJI[data.status];
        const label = STATUS_LABELS[data.status];
        setLogs(prev => [...prev, `${emoji} ${label}`]);

        if (data.status === 'completed') {
          setIsBuilding(false);
          toast.success('🎉 App created successfully!');
        } else if (data.status === 'failed') {
          setIsBuilding(false);
          toast.error('❌ Build failed. Please try again.');
        }
      } catch (error: any) {
        console.error('Failed to fetch build status:', error);
        
        // Stop polling on 404 - endpoint doesn't exist
        if (error.response?.status === 404) {
          setIsBuilding(false);
          toast.error('❌ Backend API endpoint not found. Please check your server.');
          setLogs(prev => [...prev, '❌ Error: /api/build-status endpoint returned 404', '💡 Check if your backend server is running at https://api.appdev.co.in']);
          setBuildId(null); // Stop polling
        }
      }
    };

    const interval = setInterval(pollStatus, 3000);
    pollStatus();

    return () => clearInterval(interval);
  }, [buildId, buildStatus?.status]);

  const handleStartCreating = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!appIdea.trim()) {
      toast.error('Please describe your app idea');
      return;
    }

    setIsBuilding(true);
    setLogs(['🚀 Starting to build your app...']);
    setBuildStatus(null);
    setBuildId(null);

    try {
      const { data } = await api.post<{ buildId: string; status: string }>('/api/build/start', { 
        projectName: appIdea.trim() 
      });
      setBuildId(data.buildId);
      setLogs(prev => [...prev, `✅ Build started!`]);
    } catch (error) {
      console.error('Build error:', error);
      toast.error('Failed to start build. Please try again.');
      setIsBuilding(false);
      setLogs(prev => [...prev, '❌ Failed to connect to build service']);
    }
  };

  return (
    <div className="min-h-screen gradient-hero relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10">
        <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow">
                  <Smartphone className="h-5 w-5 text-primary-foreground" />
                </div>
                <h1 className="text-xl font-bold">AppDev</h1>
              </div>
              <div className="flex items-center gap-3">
                {user ? (
                  <>
                    <Button onClick={() => navigate('/dashboard')} variant="outline">
                      Dashboard
                    </Button>
                    <Button onClick={() => navigate('/profile')} variant="ghost">
                      Profile
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => navigate('/auth')} variant="outline">
                    Sign In
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <div className="grid lg:grid-cols-2 gap-12 items-center max-w-7xl mx-auto">
            {/* Left side - Creation Interface */}
            <div className="space-y-8">
              {!isBuilding && !buildStatus ? (
                <>
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                    <Sparkles className="h-4 w-4" />
                    AI-Powered App Generation
                  </div>

                  <div className="space-y-4">
                    <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                      Start Creating{' '}
                      <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        Your App
                      </span>
                    </h1>
                    
                    <p className="text-xl text-muted-foreground">
                      Describe your app idea and watch it come to life in seconds. No coding required.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        placeholder="e.g., A fitness tracking app with workout routines..."
                        value={appIdea}
                        onChange={(e) => setAppIdea(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleStartCreating()}
                        className="h-14 text-lg pr-12 bg-card/50 backdrop-blur-sm border-border/50 focus:border-primary"
                      />
                      <button
                        onClick={handleStartCreating}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
                      >
                        <Sparkles className="w-5 h-5 text-primary" />
                      </button>
                    </div>

                    <Button
                      onClick={handleStartCreating}
                      size="lg"
                      className="w-full h-14 text-lg group"
                    >
                      {user ? 'Start Building' : 'Sign In to Start'}
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>

                    <p className="text-sm text-center text-muted-foreground">
                      Join thousands building amazing apps with AI
                    </p>
                  </div>

                  {/* Quick stats */}
                  <div className="grid grid-cols-3 gap-4 pt-8">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">30s</div>
                      <div className="text-sm text-muted-foreground">Avg. Generation Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">10k+</div>
                      <div className="text-sm text-muted-foreground">Apps Created</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">100%</div>
                      <div className="text-sm text-muted-foreground">AI-Powered</div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Building Your App
                  </div>

                  <div className="space-y-4">
                    <h2 className="text-4xl font-bold">
                      Creating
                      <span className="block text-primary">{appIdea}</span>
                    </h2>

                    {buildStatus && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{STATUS_LABELS[buildStatus.status]}</span>
                          <span className="text-muted-foreground">{buildStatus.progress}%</span>
                        </div>
                        <Progress value={buildStatus.progress} className="h-2" />
                      </div>
                    )}
                  </div>

                  <div className="bg-card rounded-xl border p-4 space-y-2 max-h-64 overflow-y-auto">
                    {logs.map((log, index) => (
                      <div key={index} className="text-sm text-muted-foreground font-mono">
                        {log}
                      </div>
                    ))}
                  </div>

                  {buildStatus?.status === 'completed' && (
                    <Button onClick={() => navigate('/dashboard')} size="lg" className="w-full">
                      View Your App <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  )}

                  {buildStatus?.status === 'failed' && (
                    <Button
                      onClick={() => {
                        setIsBuilding(false);
                        setBuildStatus(null);
                        setBuildId(null);
                        setLogs([]);
                      }}
                      size="lg"
                      variant="outline"
                      className="w-full"
                    >
                      Try Again
                    </Button>
                  )}
                </>
              )}
            </div>

            {/* Right side - Phone Mockup */}
            <div className="relative">
              <div className="relative animate-fade-in">
                <PhoneMockup>
                  <div className="h-full bg-gradient-to-br from-primary/20 to-accent/20 p-6 flex flex-col items-center justify-center space-y-6">
                    <div className="w-full space-y-4">
                      {/* Mock app interface */}
                      <div className="rounded-xl bg-card p-4 shadow-lg">
                        <div className="h-3 w-3/4 bg-primary/30 rounded mb-3" />
                        <div className="h-2 w-full bg-muted/30 rounded mb-2" />
                        <div className="h-2 w-2/3 bg-muted/30 rounded" />
                      </div>
                      
                      <div className="rounded-xl bg-card p-4 shadow-lg">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-10 w-10 rounded-full bg-accent/30" />
                          <div className="h-3 w-24 bg-primary/30 rounded" />
                        </div>
                        <div className="h-2 w-full bg-muted/30 rounded mb-2" />
                        <div className="h-2 w-4/5 bg-muted/30 rounded" />
                      </div>

                      <div className="rounded-xl bg-gradient-primary p-4 shadow-glow">
                        <div className="h-3 w-32 bg-primary-foreground/80 rounded mb-2" />
                        <div className="h-2 w-24 bg-primary-foreground/60 rounded" />
                      </div>
                    </div>

                    <div className="text-center space-y-2 pt-4">
                      <Sparkles className="h-8 w-8 text-primary mx-auto animate-pulse" />
                      <p className="text-sm font-medium text-foreground">Your app preview</p>
                    </div>
                  </div>
                </PhoneMockup>
              </div>

              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 rounded-2xl bg-card/80 backdrop-blur-sm border border-border/50 p-4 shadow-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium">AI Active</span>
                </div>
              </div>
            </div>
          </div>
        </main>

        <footer className="border-t border-border/50 mt-20">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <button onClick={() => navigate('/pricing')} className="text-muted-foreground hover:text-primary transition-colors">
                  Pricing
                </button>
                <button onClick={() => navigate('/terms')} className="text-muted-foreground hover:text-primary transition-colors">
                  Terms & Conditions
                </button>
                <button onClick={() => navigate('/privacy')} className="text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </button>
                <button onClick={() => navigate('/refunds')} className="text-muted-foreground hover:text-primary transition-colors">
                  Refunds
                </button>
                <button onClick={() => navigate('/contact')} className="text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </button>
              </div>
              <p className="text-center text-sm text-muted-foreground">
                © 2025 AppDev. Generate mobile apps with AI.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
