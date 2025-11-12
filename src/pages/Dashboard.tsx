import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://13.201.115.240:3000";

interface BuildResponse {
  buildId: string;
  status: string;
}

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
  planning: 'Planning',
  generating: 'Generating Code',
  building: 'Building',
  packaging: 'Packaging',
  completed: 'Completed',
  failed: 'Failed'
};

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const [projectName, setProjectName] = useState('');
  const [buildId, setBuildId] = useState<string | null>(null);
  const [buildStatus, setBuildStatus] = useState<BuildStatusResponse | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  // Check auth state
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
        const response = await fetch(`${BASE_URL}/build/status/${buildId}`);
        const data: BuildStatusResponse = await response.json();
        
        setBuildStatus(data);
        
        const emoji = STATUS_EMOJI[data.status];
        const label = STATUS_LABELS[data.status];
        setLogs(prev => [...prev, `${emoji} ${label}...`]);

        if (data.status === 'completed') {
          setIsBuilding(false);
          toast.success('🎉 Build complete! APK ready for download.');
        } else if (data.status === 'failed') {
          setIsBuilding(false);
          toast.error('❌ Build failed. Please try again.');
        }
      } catch (error) {
        console.error('Failed to fetch build status:', error);
      }
    };

    const interval = setInterval(pollStatus, 5000);
    pollStatus(); // Initial call

    return () => clearInterval(interval);
  }, [buildId, buildStatus?.status]);

  const handleStartBuild = async () => {
    if (!projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }

    setIsBuilding(true);
    setLogs(['🚀 Starting build...']);
    setBuildStatus(null);
    setBuildId(null);

    try {
      const response = await fetch(`${BASE_URL}/build/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectName: projectName.trim() }),
      });

      if (!response.ok) {
        throw new Error('Failed to start build');
      }

      const data: BuildResponse = await response.json();
      setBuildId(data.buildId);
      setLogs(prev => [...prev, `✅ Build started with ID: ${data.buildId}`]);
    } catch (error) {
      console.error('Build error:', error);
      toast.error('❌ Failed to start build. Please try again.');
      setIsBuilding(false);
    }
  };

  const handleNewBuild = () => {
    setProjectName('');
    setBuildId(null);
    setBuildStatus(null);
    setIsBuilding(false);
    setLogs([]);
  };

  return (
    <div className="min-h-screen gradient-hero relative overflow-hidden">
      {/* Ambient gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="w-full border-b border-border/40 bg-background/50 backdrop-blur-xl">
          <div className="container mx-auto px-4 sm:px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">AppDev AI</span>
              </div>
              {user && (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate('/auth');
                  }}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Logout
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-center justify-center px-4 py-8 sm:py-16">
          <div className="w-full max-w-3xl space-y-8 sm:space-y-12">
            {/* Hero Section */}
            <div className="text-center space-y-4 sm:space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">AI-Powered Builder</span>
              </div>
              
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                  Build Apps in Seconds
                </span>
              </h1>
              
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Transform your ideas into production-ready mobile apps with AI
              </p>
            </div>

            {/* Main Card */}
            <div className="bg-card/40 backdrop-blur-xl shadow-card border border-border/50 rounded-3xl p-6 sm:p-10 space-y-8 hover:shadow-glow transition-all duration-300">
              {!buildId ? (
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-foreground/90 block">
                      What would you like to build?
                    </label>
                    <Input
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g., A todo app with reminders and dark mode..."
                      className="h-14 text-base bg-background/50 border-border/60 focus:border-primary/60 transition-colors backdrop-blur-sm"
                      disabled={isBuilding}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !isBuilding) {
                          handleStartBuild();
                        }
                      }}
                    />
                  </div>

                  <Button 
                    onClick={handleStartBuild}
                    disabled={isBuilding || !projectName.trim()}
                    size="lg"
                    className="w-full h-14 text-base font-semibold gradient-primary hover:opacity-90 transition-all shadow-lg hover:shadow-glow"
                  >
                    {isBuilding ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Initializing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-5 w-5" />
                        Start Building
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Status Display */}
                  {buildStatus && (
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20">
                        <span className="text-5xl">{STATUS_EMOJI[buildStatus.status]}</span>
                      </div>
                      
                      <div className="space-y-2">
                        <h3 className="text-2xl font-bold text-foreground">
                          {STATUS_LABELS[buildStatus.status]}
                        </h3>
                        <p className="text-sm text-muted-foreground font-mono">
                          {buildId.slice(0, 12)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Progress Bar */}
                  {buildStatus && buildStatus.status !== 'completed' && buildStatus.status !== 'failed' && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold text-foreground">{buildStatus.progress}%</span>
                      </div>
                      <Progress value={buildStatus.progress} className="h-3 bg-secondary" />
                    </div>
                  )}

                  {/* Build Logs */}
                  {logs.length > 0 && (
                    <div className="bg-muted/30 backdrop-blur-sm rounded-2xl p-5 max-h-56 overflow-y-auto border border-border/40 space-y-2">
                      {logs.map((log, index) => (
                        <div 
                          key={index} 
                          className="text-sm text-foreground/80 font-mono animate-in fade-in slide-in-from-bottom-2 duration-300"
                          style={{ animationDelay: `${index * 50}ms` }}
                        >
                          {log}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    {buildStatus?.status === 'completed' && buildStatus.downloadUrl && (
                      <Button
                        onClick={() => {
                          window.open(buildStatus.downloadUrl, '_blank');
                          toast.success('⬇️ APK download started');
                        }}
                        size="lg"
                        className="w-full h-14 text-base font-semibold gradient-primary hover:opacity-90 transition-all shadow-lg hover:shadow-glow"
                      >
                        <Download className="mr-2 h-5 w-5" />
                        Download APK
                      </Button>
                    )}

                    {(buildStatus?.status === 'completed' || buildStatus?.status === 'failed') && (
                      <Button
                        onClick={handleNewBuild}
                        variant="outline"
                        size="lg"
                        className="w-full h-14 text-base font-medium bg-background/50 backdrop-blur-sm hover:bg-background/80 border-border/60"
                      >
                        Start New Build
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Info */}
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Powered by <span className="font-semibold text-foreground">appdev.co.in</span>
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
