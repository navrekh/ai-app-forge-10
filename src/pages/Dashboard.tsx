import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Download, Sparkles, Apple } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { ENDPOINTS, BACKEND_API_URL } from "@/config/backend";
import { api } from "@/utils/api";
import { Header } from "@/components/Header";
import { PhoneMockup } from "@/components/PhoneMockup";
import { PublishDialog } from "@/components/PublishDialog";

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
  const location = useLocation();
  const [projectName, setProjectName] = useState('');
  const [buildId, setBuildId] = useState<string | null>(null);
  const [buildStatus, setBuildStatus] = useState<BuildStatusResponse | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [showPublishDialog, setShowPublishDialog] = useState(false);

  // Auto-start build if app idea is passed from Index page
  useEffect(() => {
    const state = location.state as { appIdea?: string } | null;
    if (state?.appIdea && user) {
      setProjectName(state.appIdea);
      // Clear the state to prevent re-triggering
      window.history.replaceState({}, document.title);
      // Start build automatically
      handleStartBuild(state.appIdea);
    }
  }, [location.state, user]);

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

  const handleStartBuild = async (ideaFromProps?: string) => {
    const idea = ideaFromProps || projectName.trim();
    
    if (!idea) {
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
        projectName: idea 
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
        <Header 
          showDashboard={false} 
          showPublish={!!buildId && buildStatus?.status === 'completed'}
          onPublishClick={() => setShowPublishDialog(true)}
        />

        {/* Publish Dialog */}
        <PublishDialog
          open={showPublishDialog}
          onOpenChange={setShowPublishDialog}
          projectName={projectName}
          buildId={buildId || undefined}
        />

        {/* Main Content */}
        <main className="flex-1 container mx-auto px-4 py-8">
          {!buildId ? (
            <div className="flex items-center justify-center min-h-[80vh]">
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
                      onClick={() => handleStartBuild()}
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
                </div>

                {/* Footer Info */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    Powered by <span className="font-semibold text-foreground">appdev.co.in</span>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid lg:grid-cols-2 gap-8 items-start max-w-7xl mx-auto">
              {/* Left side - Build Progress & Logs */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Building Your App
                  </div>

                  <h2 className="text-4xl font-bold">
                    Creating
                    <span className="block text-primary mt-2">{projectName}</span>
                  </h2>
                </div>

                {/* Status Display */}
                {buildStatus && (
                  <div className="bg-card rounded-xl border p-6 space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-16 h-16 rounded-xl bg-primary/10 border border-primary/20">
                        <span className="text-4xl">{STATUS_EMOJI[buildStatus.status]}</span>
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-foreground">
                          {STATUS_LABELS[buildStatus.status]}
                        </h3>
                        <p className="text-sm text-muted-foreground font-mono">
                          Build ID: {buildId.slice(0, 12)}
                        </p>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    {buildStatus.status !== 'completed' && buildStatus.status !== 'failed' && (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-semibold text-foreground">{buildStatus.progress}%</span>
                        </div>
                        <Progress value={buildStatus.progress} className="h-2" />
                      </div>
                    )}
                  </div>
                )}

                {/* Build Logs */}
                <div className="bg-card rounded-xl border p-4 space-y-2 max-h-96 overflow-y-auto">
                  <h3 className="text-sm font-semibold mb-3">Build Logs</h3>
                  {logs.map((log, index) => (
                    <div 
                      key={index} 
                      className="text-sm text-muted-foreground font-mono animate-fade-in"
                    >
                      {log}
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {buildStatus?.status === 'completed' && buildStatus.downloadUrl && (
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() => {
                          window.open(buildStatus.downloadUrl, '_blank');
                          toast.success('⬇️ Android APK download started');
                        }}
                        size="lg"
                        className="h-12 gradient-primary"
                      >
                        <Download className="mr-2 h-5 w-5" />
                        Download APK
                      </Button>
                      
                      <Button
                        onClick={() => {
                          // TODO: Implement iOS IPA download
                          toast.info('🍎 iOS IPA build coming soon!');
                        }}
                        size="lg"
                        variant="outline"
                        className="h-12"
                      >
                        <Apple className="mr-2 h-5 w-5" />
                        Download IPA
                      </Button>
                    </div>
                  )}

                  {(buildStatus?.status === 'completed' || buildStatus?.status === 'failed') && (
                    <Button
                      onClick={handleNewBuild}
                      variant="outline"
                      size="lg"
                      className="w-full h-12"
                    >
                      Start New Build
                    </Button>
                  )}
                </div>
              </div>

              {/* Right side - Phone Mockup */}
              <div className="relative lg:sticky lg:top-8">
                <PhoneMockup>
                  <div className="h-full bg-gradient-to-br from-primary/20 to-accent/20 p-6 flex flex-col items-center justify-center space-y-6">
                    <div className="w-full space-y-4">
                      {/* Mock app interface */}
                      <div className="rounded-xl bg-card p-4 shadow-lg animate-fade-in">
                        <div className="h-3 w-3/4 bg-primary/30 rounded mb-3" />
                        <div className="h-2 w-full bg-muted/30 rounded mb-2" />
                        <div className="h-2 w-2/3 bg-muted/30 rounded" />
                      </div>
                      
                      <div className="rounded-xl bg-card p-4 shadow-lg animate-fade-in" style={{ animationDelay: '0.1s' }}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-10 w-10 rounded-full bg-accent/30" />
                          <div className="h-3 w-24 bg-primary/30 rounded" />
                        </div>
                        <div className="h-2 w-full bg-muted/30 rounded mb-2" />
                        <div className="h-2 w-4/5 bg-muted/30 rounded" />
                      </div>

                      <div className="rounded-xl bg-gradient-primary p-4 shadow-glow animate-fade-in" style={{ animationDelay: '0.2s' }}>
                        <div className="h-3 w-32 bg-primary-foreground/80 rounded mb-2" />
                        <div className="h-2 w-24 bg-primary-foreground/60 rounded" />
                      </div>
                    </div>

                    <div className="text-center space-y-2 pt-4">
                      <Sparkles className="h-8 w-8 text-primary mx-auto animate-pulse" />
                      <p className="text-sm font-medium text-foreground">Building your app...</p>
                    </div>
                  </div>
                </PhoneMockup>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
