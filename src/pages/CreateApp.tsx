import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PhoneMockup } from '@/components/PhoneMockup';
import { toast } from 'sonner';
import { ArrowLeft, Wand2, Save } from 'lucide-react';

const CreateApp = () => {
  const [user, setUser] = useState<any>(null);
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generatedApp, setGeneratedApp] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate('/auth');
      } else {
        setUser(session.user);
      }
    });
  }, [navigate]);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Please describe your app');
      return;
    }

    setGenerating(true);
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
      navigate('/dashboard');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-primary" />
                  Create New App
                </CardTitle>
                <CardDescription>
                  Describe your mobile app idea and our AI will generate a complete app structure for you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="prompt" className="text-sm font-medium">
                    What kind of app do you want to build?
                  </label>
                  <Textarea
                    id="prompt"
                    placeholder="Example: A fitness tracker app with workout logging, progress charts, meal planning features, and social sharing capabilities..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    rows={8}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Be specific! Include features, screens, and functionality you want.
                  </p>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={generating || !prompt.trim()}
                  className="w-full gradient-primary"
                  size="lg"
                >
                  {generating ? (
                    <>
                      <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
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
                    className="w-full"
                    size="lg"
                  >
                    {saving ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Project
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>

            {generatedApp && (
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle>Generated Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">App Name</p>
                      <p className="text-lg font-semibold">{generatedApp.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Screens</p>
                      <p className="text-sm">{generatedApp.screens?.length || 0} screens generated</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Components</p>
                      <p className="text-sm">{generatedApp.components?.length || 0} components</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="flex items-center justify-center">
            <PhoneMockup>
              {generatedApp ? (
                <div className="h-full p-6 overflow-y-auto">
                  <h2 className="text-2xl font-bold mb-4">{generatedApp.name}</h2>
                  {generatedApp.screens?.map((screen: any, index: number) => (
                    <div key={index} className="mb-6 p-4 border rounded-lg">
                      <h3 className="font-semibold mb-2">{screen.name}</h3>
                      <p className="text-sm text-muted-foreground">{screen.description}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center p-6 text-center">
                  <div>
                    <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                      <Wand2 className="h-8 w-8 text-muted-foreground" />
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

export default CreateApp;
