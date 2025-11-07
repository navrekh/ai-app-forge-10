import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { PhoneMockup } from '@/components/PhoneMockup';
import { toast } from 'sonner';
import { Smartphone, LogOut, Wand2, Save, FolderOpen, Loader2, Sparkles, Zap, Heart, ShoppingBag, MessageSquare, TrendingUp } from 'lucide-react';

const EXAMPLE_PROMPTS = [
  { icon: Heart, label: 'Fitness Tracker', prompt: 'A fitness tracker app with workout logging, progress charts, and meal planning' },
  { icon: ShoppingBag, label: 'Food Delivery', prompt: 'A food delivery app with restaurant menus, cart management, and order tracking' },
  { icon: MessageSquare, label: 'Chat App', prompt: 'A messaging app with real-time chat, media sharing, and group conversations' },
  { icon: TrendingUp, label: 'Finance Manager', prompt: 'A personal finance app with expense tracking, budgets, and financial insights' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedApp, setGeneratedApp] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe your app idea');
      return;
    }

    setGenerating(true);
    setGeneratedApp(null);
    setShowResult(false);

    try {
      const response = await fetch(
        'https://ai-appgen-api-680477926513.asia-south1.run.app/generate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        }
      );

      if (!response.ok) {
        throw new Error('Generation failed');
      }

      const data = await response.json();
      setGeneratedApp(data);
      
      // Delay to show the fade-in animation
      setTimeout(() => {
        setShowResult(true);
      }, 100);
      
      toast.success('App generated successfully!');
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Failed to generate app. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedApp || !user) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name: generatedApp.name || 'Untitled App',
          description: prompt,
          app_data: {
            ...generatedApp,
            screens: generatedApp.screens || [],
            components: generatedApp.components || []
          }
        });

      if (error) throw error;

      toast.success('Project saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      navigate('/auth');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/30 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow">
                <Smartphone className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">MobileDev Builder</h1>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/projects')}
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                Projects
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="min-h-[calc(100vh-12rem)] flex items-center">
          <div className="w-full grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left Side - Prompt Card */}
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-4xl lg:text-5xl font-bold mb-3 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  Build Your Dream App
                </h2>
                <p className="text-muted-foreground text-lg">
                  Describe your idea and watch AI create it instantly
                </p>
              </div>

              {/* Glassmorphism Card */}
              <Card className="border-border/50 bg-card/30 backdrop-blur-xl shadow-2xl p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span>What would you like to build?</span>
                  </div>
                  <Textarea
                    placeholder="Describe your app idea in detail... Include features, screens, and functionality you want."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={6}
                    className="resize-none text-base bg-background/50 border-border/50 focus:border-primary/50 transition-colors"
                    disabled={generating}
                  />
                </div>

                {/* Example Suggestions */}
                <div className="space-y-3">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Try these examples
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {EXAMPLE_PROMPTS.map((example, index) => {
                      const Icon = example.icon;
                      return (
                        <button
                          key={index}
                          onClick={() => handleExampleClick(example.prompt)}
                          disabled={generating}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Icon className="h-3 w-3" />
                          {example.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleGenerate}
                    disabled={generating || !prompt.trim()}
                    className="flex-1 h-12 gradient-primary shadow-glow text-base font-semibold"
                    size="lg"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-5 w-5" />
                        Generate App
                      </>
                    )}
                  </Button>

                  {generatedApp && !generating && (
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      variant="outline"
                      size="lg"
                      className="h-12 border-primary/20 hover:bg-primary/10"
                    >
                      {saving ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Save className="h-5 w-5" />
                      )}
                    </Button>
                  )}
                </div>

                {/* Result Stats */}
                {generatedApp && !generating && (
                  <div className="pt-4 border-t border-border/50 animate-fade-in">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Screens Generated</p>
                        <p className="text-2xl font-bold text-primary">
                          {generatedApp.screens?.length || 0}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Components</p>
                        <p className="text-2xl font-bold text-primary">
                          {generatedApp.components?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>

            {/* Right Side - Phone Preview */}
            <div className="flex flex-col items-center justify-center gap-6 animate-scale-in">
              <div className="relative">
                {/* Glow effect behind phone */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl scale-110 opacity-50" />
                
                <PhoneMockup>
                  {generating ? (
                    <div className="h-full flex items-center justify-center p-6 relative overflow-hidden">
                      {/* Animated background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/10 animate-pulse" />
                      
                      <div className="relative text-center z-10">
                        <div className="relative mb-6">
                          <Loader2 className="mx-auto h-16 w-16 animate-spin text-primary" />
                          <div className="absolute inset-0 animate-ping opacity-20">
                            <Loader2 className="mx-auto h-16 w-16 text-primary" />
                          </div>
                        </div>
                        <p className="text-lg font-semibold mb-2">Generating Your App</p>
                        <p className="text-sm text-muted-foreground">
                          Creating screens and components...
                        </p>
                      </div>
                    </div>
                  ) : generatedApp && showResult ? (
                    <div className="h-full p-6 overflow-y-auto animate-fade-in">
                      <div className="mb-4 pb-4 border-b border-border/50">
                        <h2 className="text-2xl font-bold mb-1">{generatedApp.name}</h2>
                        <p className="text-xs text-muted-foreground">
                          {generatedApp.screens?.length || 0} screens • {generatedApp.components?.length || 0} components
                        </p>
                      </div>
                      
                      <div className="space-y-3">
                        {generatedApp.screens?.map((screen: any, index: number) => (
                          <div 
                            key={index} 
                            className="p-4 rounded-xl bg-gradient-to-br from-card/50 to-card/30 border border-border/50 hover:shadow-md transition-all"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-shrink-0 w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                                {index + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold mb-1 text-sm">{screen.name}</h3>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {screen.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex items-center justify-center p-6 text-center">
                      <div className="space-y-4">
                        <div className="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                          <Smartphone className="h-10 w-10 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold mb-1">Ready to Generate</p>
                          <p className="text-sm text-muted-foreground">
                            Your app preview will appear here
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </PhoneMockup>
              </div>

              {/* Action Buttons */}
              {generatedApp && !generating && (
                <div className="w-full max-w-[375px] space-y-3 animate-fade-in">
                  <div className="flex gap-2">
                    <Button
                      disabled
                      variant="outline"
                      className="flex-1 border-border/50 bg-card/30 backdrop-blur-xl"
                    >
                      Download APK
                    </Button>
                    <Button
                      disabled
                      variant="outline"
                      className="flex-1 border-border/50 bg-card/30 backdrop-blur-xl"
                    >
                      Download IPA
                    </Button>
                  </div>
                  <Button
                    disabled
                    variant="outline"
                    className="w-full border-border/50 bg-card/30 backdrop-blur-xl"
                  >
                    View Code
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
