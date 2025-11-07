import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { PhoneMockup } from '@/components/PhoneMockup';
import { toast } from 'sonner';
import { Smartphone, Wand2, Loader2, Sparkles, Zap, Heart, ShoppingBag, MessageSquare, TrendingUp } from 'lucide-react';

const EXAMPLE_PROMPTS = [
  { icon: Heart, label: 'Fitness Tracker', prompt: 'A fitness tracker app with workout logging, progress charts, and meal planning' },
  { icon: ShoppingBag, label: 'Food Delivery', prompt: 'A food delivery app with restaurant menus, cart management, and order tracking' },
  { icon: MessageSquare, label: 'Chat App', prompt: 'A messaging app with real-time chat, media sharing, and group conversations' },
  { icon: TrendingUp, label: 'Finance Manager', prompt: 'A personal finance app with expense tracking, budgets, and financial insights' },
];

const Dashboard = () => {
  const [prompt, setPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generatedApp, setGeneratedApp] = useState<any>(null);
  const [showResult, setShowResult] = useState(false);

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
        toast.error('Error generating app.');
        return;
      }

      const data = await response.json();
      
      if (data.success !== true) {
        toast.error('Error generating app.');
        return;
      }

      toast.success('App generated successfully!');
      setGeneratedApp(data);
      
      // Delay to show the fade-in animation
      setTimeout(() => {
        setShowResult(true);
      }, 100);
    } catch (error) {
      console.error('Generation error:', error);
      toast.error('Error generating app.');
    } finally {
      setGenerating(false);
    }
  };

  const handleExampleClick = (examplePrompt: string) => {
    setPrompt(examplePrompt);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow">
              <Smartphone className="h-5 w-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">MobileDev Builder</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-3xl lg:text-4xl font-bold">
              Build Your Dream App
            </h2>
            <p className="text-muted-foreground">
              Describe your idea and watch AI create it instantly
            </p>
          </div>

          {/* Phone Preview */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl scale-110 opacity-50" />
              
              <PhoneMockup>
                {generating ? (
                  <div className="h-full flex items-center justify-center p-6 relative overflow-hidden">
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
          </div>

          {/* Disabled Action Buttons - Always Visible */}
          <div className="max-w-[375px] mx-auto space-y-3">
            <div className="flex gap-2">
              <Button
                disabled
                variant="outline"
                className="flex-1"
              >
                Download APK
              </Button>
              <Button
                disabled
                variant="outline"
                className="flex-1"
              >
                Download IPA
              </Button>
            </div>
            <Button
              disabled
              variant="outline"
              className="w-full"
            >
              View Code
            </Button>
          </div>

          {/* Prompt Input Card */}
          <Card className="border-border/50 bg-card/50 backdrop-blur-xl shadow-xl p-6 space-y-6 max-w-2xl mx-auto">
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

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className="w-full h-12 gradient-primary shadow-glow text-base font-semibold"
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
      </main>
    </div>
  );
};

export default Dashboard;
