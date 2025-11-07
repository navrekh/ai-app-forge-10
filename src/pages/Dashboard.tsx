import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { PhoneMockup } from '@/components/PhoneMockup';
import { toast } from 'sonner';
import { Smartphone, LogOut, Wand2, Save, FolderOpen, Loader2 } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedApp, setGeneratedApp] = useState<any>(null);

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
      setPrompt('');
      setGeneratedApp(null);
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

  if (loading || !user) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow">
                <Smartphone className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">MobileDev Builder</h1>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => navigate('/projects')}
              >
                <FolderOpen className="mr-2 h-4 w-4" />
                My Projects
              </Button>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold mb-2">Generate Your Mobile App</h2>
          <p className="text-muted-foreground">
            Describe your app idea and watch AI create it instantly
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Generation Form */}
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-primary" />
                  App Idea
                </CardTitle>
                <CardDescription>
                  Describe what kind of mobile app you want to build
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="prompt" className="text-sm font-medium">
                    What's your app idea?
                  </label>
                  <Textarea
                    id="prompt"
                    placeholder="Example: A fitness tracker app with workout logging, progress charts, meal planning, and social sharing features..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={10}
                    className="resize-none"
                    disabled={generating}
                  />
                  <p className="text-xs text-muted-foreground">
                    Be specific about features, screens, and functionality
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleGenerate}
                    disabled={generating || !prompt.trim()}
                    className="flex-1 gradient-primary"
                    size="lg"
                  >
                    {generating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Wand2 className="mr-2 h-4 w-4" />
                        Generate App
                      </>
                    )}
                  </Button>

                  {generatedApp && (
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      variant="outline"
                      size="lg"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Save
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {generatedApp && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Generated Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">App Name</p>
                      <p className="text-lg font-semibold">{generatedApp.name}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Screens</p>
                        <p className="text-2xl font-bold text-primary">
                          {generatedApp.screens?.length || 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Components</p>
                        <p className="text-2xl font-bold text-primary">
                          {generatedApp.components?.length || 0}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Phone Preview */}
          <div className="flex items-start justify-center lg:sticky lg:top-24">
            <PhoneMockup>
              {generating ? (
                <div className="h-full flex items-center justify-center p-6">
                  <div className="text-center">
                    <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary mb-4" />
                    <p className="text-sm text-muted-foreground">
                      Generating your app...
                    </p>
                  </div>
                </div>
              ) : generatedApp ? (
                <div className="h-full p-6 overflow-y-auto">
                  <h2 className="text-2xl font-bold mb-4">{generatedApp.name}</h2>
                  <div className="space-y-4">
                    {generatedApp.screens?.map((screen: any, index: number) => (
                      <div key={index} className="p-4 border rounded-lg bg-card/50">
                        <h3 className="font-semibold mb-2">{screen.name}</h3>
                        <p className="text-sm text-muted-foreground">{screen.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center p-6 text-center">
                  <div>
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                      <Smartphone className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">
                      Your generated app will appear here
                    </p>
                  </div>
                </div>
              )}
            </PhoneMockup>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
