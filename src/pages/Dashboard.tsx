import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PhoneMockup } from '@/components/PhoneMockup';
import { toast } from 'sonner';
import { Smartphone, Wand2, Loader2 } from 'lucide-react';

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 sticky top-0 z-50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-glow">
              <Smartphone className="h-6 w-6 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">MobileDev Builder</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 lg:py-20">
        <div className="max-w-5xl mx-auto space-y-12">
          {/* Title */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl lg:text-5xl font-bold">
              Build Your Dream App
            </h2>
            <p className="text-lg text-muted-foreground">
              Describe your idea and watch AI create it instantly
            </p>
          </div>

          {/* Phone Preview */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-primary/5 blur-3xl scale-110" />
              
              <PhoneMockup>
                {generating ? (
                  <div className="h-full flex items-center justify-center p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 animate-pulse" />
                    
                    <div className="relative text-center z-10">
                      <div className="relative mb-8">
                        <Loader2 className="mx-auto h-20 w-20 animate-spin text-primary" />
                        <div className="absolute inset-0 animate-ping opacity-20">
                          <Loader2 className="mx-auto h-20 w-20 text-primary" />
                        </div>
                      </div>
                      <p className="text-xl font-semibold mb-2">Generating Your App</p>
                      <p className="text-sm text-muted-foreground">
                        Creating screens and components...
                      </p>
                    </div>
                  </div>
                ) : generatedApp && showResult ? (
                  <div className="h-full p-6 overflow-y-auto animate-fade-in">
                    <div className="mb-6 pb-4 border-b border-border/50">
                      <h2 className="text-2xl font-bold mb-2">{generatedApp.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {generatedApp.screens?.length || 0} screens • {generatedApp.components?.length || 0} components
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      {generatedApp.screens?.map((screen: any, index: number) => (
                        <div 
                          key={index} 
                          className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-border/50 hover:shadow-md transition-all"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold shadow-lg">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold mb-1">{screen.name}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {screen.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center p-8 text-center">
                    <div className="space-y-6">
                      <div className="mx-auto w-24 h-24 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center shadow-lg">
                        <Smartphone className="h-12 w-12 text-primary" />
                      </div>
                      <div>
                        <p className="text-lg font-semibold mb-2">Ready to Generate</p>
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

          {/* Disabled Action Buttons */}
          <div className="max-w-[375px] mx-auto space-y-3">
            <div className="flex gap-3">
              <Button
                disabled
                variant="outline"
                className="flex-1 h-11"
              >
                Download APK
              </Button>
              <Button
                disabled
                variant="outline"
                className="flex-1 h-11"
              >
                Download IPA
              </Button>
            </div>
            <Button
              disabled
              variant="outline"
              className="w-full h-11"
            >
              View Code
            </Button>
          </div>

          {/* Prompt Input Section */}
          <div className="max-w-2xl mx-auto space-y-6">
            <Textarea
              placeholder="Describe your app idea in detail... Include features, screens, and functionality you want."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={6}
              className="resize-none text-base border-border/50 focus:border-primary transition-colors shadow-sm"
              disabled={generating}
            />

            {/* Generate Button */}
            <Button
              onClick={handleGenerate}
              disabled={generating || !prompt.trim()}
              className="w-full h-14 gradient-primary shadow-glow text-lg font-semibold hover:scale-[1.02] transition-transform"
              size="lg"
            >
              {generating ? (
                <>
                  <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-6 w-6" />
                  Generate App
                </>
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
