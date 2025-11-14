import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { ENDPOINTS, BACKEND_API_URL } from "@/config/backend";
import { api } from "@/utils/api";
import { Header } from "@/components/Header";

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
        const { data } = await api.get<BuildStatusResponse>(`/api/build-status/${buildId}`);
        console.log('Build status:', data);
        
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
    setLogs(['🚀 Starting build...', `🔗 Connecting to ${BACKEND_API_URL}`]);
    setBuildStatus(null);
    setBuildId(null);

    try {
      console.log('Attempting to connect to:', ENDPOINTS.START_BUILD);
      
      const { data } = await api.post<BuildResponse>('/api/build/start', {
        projectName: projectName.trim() 
      });
      console.log('Build started successfully:', data);
      setBuildId(data.buildId);
      setLogs(prev => [...prev, `✅ Build started with ID: ${data.buildId}`]);
    } catch (error) {
      console.error('Build error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
        toast.error('❌ Cannot connect to backend. Please check if the server is running at ' + BACKEND_API_URL);
        setLogs(prev => [...prev, `❌ Connection failed: Cannot reach ${BACKEND_API_URL}`, '💡 Check: 1) Server is running 2) SSL configured 3) CORS enabled']);
      } else {
        toast.error(`❌ Build failed: ${errorMessage}`);
        setLogs(prev => [...prev, `❌ Error: ${errorMessage}`]);
      }
      
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
        <Header showDashboard={false} />

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
