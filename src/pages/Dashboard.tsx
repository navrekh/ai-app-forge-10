import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Download, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const BASE_URL = "https://appdev.co.in/api";

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
    <div className="min-h-screen gradient-hero flex flex-col">
      {/* Header */}
      <header className="w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-sm text-muted-foreground">Powered by AppDev AI</span>
            </div>
            {user && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={async () => {
                  await supabase.auth.signOut();
                  navigate('/auth');
                }}
              >
                Logout
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content - Centered */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-2xl space-y-8">
          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              AppDev AI Builder
            </h1>
            <p className="text-muted-foreground">
              Transform your ideas into mobile apps instantly
            </p>
          </div>

          {/* Main Card */}
          <div className="bg-card/60 backdrop-blur-sm shadow-card rounded-2xl p-6 sm:p-8 space-y-6 border border-border/50">
            {!buildId ? (
              <>
                {/* Input Section */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">
                      Enter project name or idea
                    </label>
                    <Input
                      value={projectName}
                      onChange={(e) => setProjectName(e.target.value)}
                      placeholder="e.g., My Amazing Todo App"
                      className="text-base h-12"
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
                    className="w-full h-12 text-base font-semibold"
                  >
                    {isBuilding ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Starting Build...
                      </>
                    ) : (
                      'Start Build'
                    )}
                  </Button>
                </div>
              </>
            ) : (
              <>
                {/* Progress Section */}
                <div className="space-y-6">
                  {/* Status Badge */}
                  {buildStatus && (
                    <div className="flex items-center justify-center gap-3">
                      <span className="text-4xl">{STATUS_EMOJI[buildStatus.status]}</span>
                      <div className="text-center">
                        <p className="text-xl font-semibold text-foreground">
                          {STATUS_LABELS[buildStatus.status]}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Build ID: {buildId.slice(0, 8)}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Progress Bar */}
                  {buildStatus && buildStatus.status !== 'completed' && buildStatus.status !== 'failed' && (
                    <div className="space-y-2">
                      <Progress value={buildStatus.progress} className="h-2" />
                      <p className="text-sm text-center text-muted-foreground">
                        {buildStatus.progress}% complete
                      </p>
                    </div>
                  )}

                  {/* Build Logs */}
                  {logs.length > 0 && (
                    <div className="bg-muted/50 rounded-lg p-4 max-h-48 overflow-y-auto space-y-1">
                      {logs.map((log, index) => (
                        <p key={index} className="text-sm text-foreground font-mono">
                          {log}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Download Button */}
                  {buildStatus?.status === 'completed' && buildStatus.downloadUrl && (
                    <Button
                      onClick={() => {
                        window.open(buildStatus.downloadUrl, '_blank');
                        toast.success('⬇️ APK download started');
                      }}
                      size="lg"
                      className="w-full h-12 text-base font-semibold"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Download APK
                    </Button>
                  )}

                  {/* New Build Button */}
                  {(buildStatus?.status === 'completed' || buildStatus?.status === 'failed') && (
                    <Button
                      onClick={handleNewBuild}
                      variant="outline"
                      size="lg"
                      className="w-full h-12 text-base"
                    >
                      Start New Build
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Info Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>Hosted at <span className="font-medium text-foreground">appdev.co.in</span></p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
