import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PhoneMockup } from "@/components/PhoneMockup";
import { Loader2, Download, Eye, RefreshCw, Clock, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HistoryPanel } from "@/components/HistoryPanel";
import { supabase } from "@/integrations/supabase/client";
import { DownloadAPKButton } from "@/components/DownloadAPKButton";
import { useNavigate } from "react-router-dom";
import { BACKEND_CONFIG, getAuthHeaders } from "@/config/backend";

interface RecentPrompt {
  prompt: string;
  timestamp: number;
}

interface ApiResponse {
  success?: boolean;
  stored?: boolean;
  download_url?: string;
  file?: string;
  zip_base64?: string;
  error?: string;
}

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiResponse, setApiResponse] = useState<ApiResponse | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [recentPrompts, setRecentPrompts] = useState<RecentPrompt[]>([]);
  const [showApiModal, setShowApiModal] = useState(false);
  const [showShakeError, setShowShakeError] = useState(false);
  const [currentAppId, setCurrentAppId] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);

  const charLimit = 1000;
  const charCount = prompt.length;

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

  // Load recent prompts from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentPrompts');
    if (stored) {
      try {
        setRecentPrompts(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse recent prompts:', e);
      }
    }
  }, []);

  // Check API health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch(`${BACKEND_CONFIG.generateAppUrl}/health`);
        const data = await response.json();
        setApiStatus(data.status === 'healthy' ? 'online' : 'offline');
      } catch (error) {
        console.error('Health check failed:', error);
        setApiStatus('offline');
      }
    };
    checkHealth();
  }, []);

  const saveRecentPrompt = (promptText: string) => {
    const newPrompt: RecentPrompt = {
      prompt: promptText,
      timestamp: Date.now(),
    };
    const updated = [newPrompt, ...recentPrompts.filter(p => p.prompt !== promptText)].slice(0, 5);
    setRecentPrompts(updated);
    localStorage.setItem('recentPrompts', JSON.stringify(updated));
  };

  const handleGenerate = async () => {
    const trimmedPrompt = prompt.trim();
    
    if (!trimmedPrompt) {
      setShowShakeError(true);
      setTimeout(() => setShowShakeError(false), 500);
      toast.error("Please describe your app.");
      return;
    }

    if (trimmedPrompt.length > charLimit) {
      toast.error(`Prompt must be ${charLimit} characters or less.`);
      return;
    }

    setIsGenerating(true);
    setApiResponse(null);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Authentication required');
        return;
      }

      const headers = await getAuthHeaders(session.access_token);
      const response = await fetch(`${BACKEND_CONFIG.generateAppUrl}/generate-app`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ prompt: trimmedPrompt }),
      });

      const data: ApiResponse = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.success) {
        setApiResponse(data);
        saveRecentPrompt(trimmedPrompt);
        
        // Save to database
        try {
          const { data: session } = await supabase.auth.getSession();
          const { data: insertData, error: insertError } = await supabase
            .from('app_history')
            .insert({
              prompt: trimmedPrompt,
              download_url: data.download_url || null,
              zip_base64: data.zip_base64 || null,
              user_id: session?.session?.user?.id || null,
            })
            .select()
            .single();

          if (!insertError && insertData) {
            setCurrentAppId(insertData.id);
            setHistoryKey(prev => prev + 1); // Refresh history panel
          }
        } catch (dbError) {
          console.error('Failed to save to database:', dbError);
        }
        
        toast.success("Your app has been generated!");
      } else {
        throw new Error('Generation failed');
      }
    } catch (error) {
      console.error('Generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to generate app';
      toast.error(`Generation failed: ${errorMessage}`, {
        action: {
          label: 'Retry',
          onClick: handleGenerate,
        },
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!apiResponse) return;

    if (apiResponse.download_url) {
      window.open(apiResponse.download_url, '_blank');
    } else if (apiResponse.zip_base64 && apiResponse.file) {
      // Fallback: decode base64 and trigger download
      try {
        const byteCharacters = atob(apiResponse.zip_base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/zip' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = apiResponse.file;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } catch (error) {
        console.error('Download failed:', error);
        toast.error("Could not decode the ZIP file.");
      }
    }
  };

  const handleNewGeneration = () => {
    setPrompt('');
    setApiResponse(null);
    setCurrentAppId(null);
    setCopiedUrl(false);
  };

  const handleCopyShareUrl = () => {
    if (!currentAppId) return;
    const shareUrl = `${window.location.origin}/shared/${currentAppId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedUrl(true);
    toast.success('Share link copied to clipboard!');
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleLoadPrompt = (promptText: string) => {
    setPrompt(promptText);
    setApiResponse(null);
  };

  return (
    <div className="min-h-screen gradient-hero">
      {/* Header */}
      <header className="w-full border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-6">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate">
                MobileDev
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 hidden sm:block">AI App Builder for React Native</p>
            </div>
            <div className="flex items-center gap-1 sm:gap-3 flex-shrink-0">
              <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                apiStatus === 'online' 
                  ? 'bg-green-500/10 text-green-600 dark:text-green-400' 
                  : apiStatus === 'offline'
                  ? 'bg-muted text-muted-foreground'
                  : 'bg-muted text-muted-foreground animate-pulse'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  apiStatus === 'online' ? 'bg-green-500' : 'bg-muted-foreground'
                }`} />
                API: {apiStatus === 'checking' ? 'Checking...' : apiStatus === 'online' ? 'Online' : 'Offline'}
              </div>
              {user && (
                <div className="flex items-center gap-1 sm:gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/builds-history')}
                    className="text-xs sm:text-sm px-2 sm:px-3"
                  >
                    <span className="hidden sm:inline">History</span>
                    <span className="sm:hidden">📋</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/profile')}
                    className="text-xs sm:text-sm px-2 sm:px-3"
                  >
                    <span className="hidden sm:inline">Profile</span>
                    <span className="sm:hidden">👤</span>
                  </Button>
                  <span className="text-xs sm:text-sm text-muted-foreground hidden lg:inline truncate max-w-[150px]">{user.email}</span>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={async () => {
                      await supabase.auth.signOut();
                      navigate('/auth');
                    }}
                    className="text-xs sm:text-sm"
                  >
                    Logout
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-12">
        <div className="max-w-7xl mx-auto">
          {/* Hero Text */}
          <div className="text-center mb-6 sm:mb-12 space-y-2 sm:space-y-3">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground px-2">
              Turn your app idea into reality in minutes.
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
              Describe what you want to build, and our AI creates a complete mobile app—ready to download and launch.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-4 sm:gap-8">
            {/* Left Panel - Form */}
            <div className="space-y-4 sm:space-y-6 lg:col-span-2">{/* Form section */}
              <div className="bg-card shadow-card rounded-xl p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Describe your app
                  </label>
                  <Textarea
                    placeholder="Build me a fitness tracking app UI with workout logging, progress charts, and user profiles..."
                    value={prompt}
                    onChange={(e) => {
                      if (e.target.value.length <= charLimit) {
                        setPrompt(e.target.value);
                      }
                    }}
                    className={`min-h-[200px] text-base transition-all ${
                      showShakeError ? 'animate-[shake_0.5s_ease-in-out] border-destructive' : ''
                    }`}
                  />
                  <div className="flex justify-between items-center text-xs">
                    <p className="text-muted-foreground">
                      We'll generate a full Expo project and give you a download link.
                    </p>
                    <p className={`font-medium ${charCount > charLimit * 0.9 ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {charCount} / {charLimit}
                    </p>
                  </div>
                </div>

                <Button 
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim() || apiStatus === 'offline'}
                  size="lg"
                  className="w-full text-sm sm:text-base"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 sm:h-5 w-4 sm:w-5 animate-spin" />
                      <span className="hidden sm:inline">Generating your app...</span>
                      <span className="sm:hidden">Generating...</span>
                    </>
                  ) : (
                    'Generate App'
                  )}
                </Button>
              </div>

              {/* Recent Prompts */}
              {recentPrompts.length > 0 && (
                <div className="bg-card shadow-card rounded-xl p-4 sm:p-6 space-y-3 sm:space-y-4">
                  <h3 className="text-xs sm:text-sm font-semibold text-foreground flex items-center gap-2">
                    <Clock className="h-3 sm:h-4 w-3 sm:w-4" />
                    Recent prompts
                  </h3>
                  <div className="space-y-2">
                    {recentPrompts.map((recent, index) => (
                      <button
                        key={index}
                        onClick={() => handleLoadPrompt(recent.prompt)}
                        className="w-full text-left p-2 sm:p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-xs sm:text-sm text-foreground line-clamp-2"
                      >
                        {recent.prompt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* History Panel */}
              <HistoryPanel key={historyKey} />
            </div>

            {/* Right Panel - Phone Preview */}
            <div className="space-y-4 sm:space-y-6 lg:col-span-1">
              <div className="bg-card shadow-card rounded-xl p-4 sm:p-6 lg:p-8 flex justify-center">
                <PhoneMockup>
                  {isGenerating ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-4 p-6">
                      <Loader2 className="h-12 w-12 animate-spin text-primary" />
                      <p className="text-sm text-muted-foreground text-center">
                        Generating your app…
                      </p>
                    </div>
                  ) : apiResponse?.success ? (
                    <div className="h-full overflow-y-auto p-6 space-y-6">
                      <div className="text-center space-y-2">
                        <div className="w-12 h-12 bg-primary rounded-xl mx-auto flex items-center justify-center text-primary-foreground font-bold text-xl">
                          A
                        </div>
                        <h2 className="text-lg font-bold text-foreground">
                          {prompt.split(' ').slice(0, 4).join(' ')}...
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          React Native App
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        <div className="bg-muted/50 rounded-lg p-4 text-center">
                          <p className="text-xs font-medium text-foreground">Home</p>
                        </div>
                        <div className="bg-muted/30 rounded-lg p-4 text-center">
                          <p className="text-xs font-medium text-muted-foreground">Details</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full p-6">
                      <p className="text-sm text-muted-foreground text-center">
                        Your app preview will appear here after generation.
                      </p>
                    </div>
                  )}
                </PhoneMockup>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button 
                  onClick={handleDownload}
                  disabled={!apiResponse?.success}
                  size="lg"
                  className="w-full"
                  variant="outline"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download Code (ZIP)
                </Button>

                {currentAppId && (
                  <>
                    <DownloadAPKButton 
                      appHistoryId={currentAppId}
                      disabled={!apiResponse?.success}
                    />
                    
                    <Button 
                      onClick={handleCopyShareUrl}
                      size="lg"
                      className="w-full"
                      variant="outline"
                    >
                      {copiedUrl ? (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Link Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Share Link
                        </>
                      )}
                    </Button>
                  </>
                )}

                {/* Direct APK/IPA Download Buttons */}
                <div className="pt-3 border-t border-border/40 space-y-2">
                  <a
                    href={`${BACKEND_CONFIG.mobileDevApiUrl}/download/apk`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => toast.success('APK download started ✅')}
                    className="flex items-center justify-center gap-2 w-full px-5 py-3 bg-foreground text-background rounded-lg font-semibold text-sm hover:opacity-80 transition-opacity"
                  >
                    <Download className="h-4 w-4" />
                    Download Android App (APK)
                  </a>
                  
                  <Button
                    disabled
                    size="lg"
                    className="w-full"
                    variant="outline"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download iOS App (Coming Soon)
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    onClick={() => setShowApiModal(true)}
                    disabled={!apiResponse}
                    variant="outline"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View JSON
                  </Button>

                  <Button 
                    onClick={handleNewGeneration}
                    disabled={!apiResponse}
                    variant="outline"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    New
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* API Response Modal */}
      <Dialog open={showApiModal} onOpenChange={setShowApiModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>API Response</DialogTitle>
            <DialogDescription>
              Raw JSON response from the generation endpoint
            </DialogDescription>
          </DialogHeader>
          <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
            {JSON.stringify(apiResponse, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
