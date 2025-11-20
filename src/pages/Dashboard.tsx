import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Smartphone, Send, Download, Settings, Upload, Plug, FileText } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { PhoneMockup } from "@/components/PhoneMockup";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PublishModal } from "@/components/PublishModal";
import { IntegrationsModal } from "@/components/IntegrationsModal";
import { NavLink } from "@/components/NavLink";

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'system',
      content: 'Welcome to AppDev! Describe your app idea or paste a Figma URL to get started.',
      timestamp: new Date()
    }
  ]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showIntegrationsModal, setShowIntegrationsModal] = useState(false);
  const [selectedFramework, setSelectedFramework] = useState<'react-native' | 'flutter'>('react-native');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [previewContent, setPreviewContent] = useState({
    title: 'My App',
    screens: ['Welcome Screen']
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const state = location.state as { appIdea?: string; figmaUrl?: string; templateId?: string } | null;
    if (state?.appIdea) {
      setPrompt(state.appIdea);
      handleSendPrompt(state.appIdea);
      window.history.replaceState({}, document.title);
    } else if (state?.figmaUrl) {
      setPrompt(`Import from Figma: ${state.figmaUrl}`);
      handleSendPrompt(`Import from Figma: ${state.figmaUrl}`);
      window.history.replaceState({}, document.title);
    } else if (state?.templateId) {
      setPrompt(`Create app from ${state.templateId} template`);
      handleSendPrompt(`Create app from ${state.templateId} template`);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendPrompt = async (customPrompt?: string) => {
    const messageContent = customPrompt || prompt.trim();
    
    if (!messageContent) {
      toast.error('Please enter a prompt');
      return;
    }

    const userMessage: Message = {
      role: 'user',
      content: messageContent,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setPrompt('');
    setIsGenerating(true);

    try {
      // Call generate-app function (costs 10 credits)
      const { data, error } = await supabase.functions.invoke('generate-app', {
        body: { 
          prompt: messageContent,
          framework: selectedFramework
        }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        // Handle insufficient credits
        if (data.requiredCredits) {
          toast.error(`Insufficient credits. You need ${data.requiredCredits} credits to generate an app.`, {
            action: {
              label: 'Buy Credits',
              onClick: () => navigate('/pricing')
            }
          });
        } else {
          toast.error(data.error);
        }
        setIsGenerating(false);
        return;
      }

      // Display AI-generated app structure
      const assistantMessage: Message = {
        role: 'assistant',
        content: `✅ App generated successfully! (10 credits used)\n\n**${data.appStructure.title}**\n\n${data.appStructure.description}\n\n**Screens:**\n${data.appStructure.screens.map((s: any) => `• ${s.name}: ${s.description}`).join('\n')}\n\n**Credits remaining:** ${data.creditsRemaining}`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsGenerating(false);
      
      setPreviewContent({
        title: data.appStructure.title,
        screens: data.appStructure.screens.map((s: any) => s.name)
      });
      
      toast.success('App generated successfully!');
    } catch (error: any) {
      console.error('Generation error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `❌ Failed to generate app: ${error.message || 'Unknown error'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsGenerating(false);
      toast.error('Failed to generate app');
    }
  };

  const handleDownloadAPK = () => {
    toast.info('APK download will be available after app generation');
  };

  const handleDownloadIPA = () => {
    toast.info('IPA download will be available after app generation');
  };

  return (
    <div className="flex min-h-screen bg-background w-full">
      {/* Left Sidebar */}
      <aside className="hidden lg:flex w-52 border-r bg-card flex-col">
        <div className="p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold">AppDev</h1>
          </div>
        </div>
        
        <nav className="flex-1 p-4">
          <div className="space-y-2">
            <NavLink
              to="/"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              activeClassName="bg-accent text-accent-foreground font-medium"
            >
              <Smartphone className="w-5 h-5" />
              <span>Home</span>
            </NavLink>
            <NavLink
              to="/projects"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              activeClassName="bg-accent text-accent-foreground font-medium"
            >
              <FileText className="w-5 h-5" />
              <span>My Projects</span>
            </NavLink>
            <NavLink
              to="/builds-history"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              activeClassName="bg-accent text-accent-foreground font-medium"
            >
              <Download className="w-5 h-5" />
              <span>Build History</span>
            </NavLink>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col w-full">
        {/* Header */}
        <header className="border-b bg-card h-16 flex items-center justify-between px-6 sticky top-0 z-50">
          <div className="lg:hidden flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-bold">AppDev</h1>
          </div>
          
          <div className="hidden lg:block" />
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => navigate('/projects')}
              variant="default"
              size="sm"
              className="gap-2"
            >
              <FileText className="w-4 h-4" />
              New Project
            </Button>
            <Button 
              onClick={() => setShowIntegrationsModal(true)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Plug className="w-4 h-4" />
              Integrations
            </Button>
            <Button 
              onClick={() => setShowPublishModal(true)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Publish
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/user-profile')}>
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
          {/* Center - Preview Area */}
          <div className="flex flex-col items-center justify-start pt-4">
            <div className="w-full max-w-xl space-y-4">
              <div className="flex gap-2 justify-center">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleDownloadAPK}
                >
                  <Download className="w-4 h-4" />
                  Download APK
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={handleDownloadIPA}
                >
                  <Download className="w-4 h-4" />
                  Download IPA
                </Button>
              </div>
              
              <div className="flex justify-center">
                <PhoneMockup>
                  <div className="p-6 h-full bg-background">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold">{previewContent.title}</h2>
                      <div className="w-12 h-12 rounded-full bg-primary" />
                    </div>
                    <div className="space-y-3">
                      {previewContent.screens.map((screen, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg border-2 border-primary/20 flex items-center justify-center">
                              <Smartphone className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{screen}</p>
                              <p className="text-sm text-muted-foreground">Ready to use</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                    <div className="mt-8 text-center text-muted-foreground text-sm">
                      <p>Start by describing your app idea</p>
                    </div>
                  </div>
                </PhoneMockup>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Chat Interface */}
          <div className="flex flex-col h-[calc(100vh-7rem)]">
            <Card className="flex-1 flex flex-col p-6">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-lg font-semibold">AI Assistant</h3>
              </div>
              
              <div className="mb-4 p-3 bg-accent/50 rounded-lg text-sm">
                Describe your app or paste Figma URL
              </div>

              <ScrollArea className="flex-1 mb-4">
                <div className="space-y-3 pr-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isGenerating && (
                    <div className="flex justify-start">
                      <div className="bg-muted rounded-lg p-3">
                        <p className="text-sm">Generating...</p>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="space-y-3 pt-3 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2"
                  onClick={() => navigate('/figma-import')}
                >
                  <Upload className="w-4 h-4" />
                  Import Figma Design
                </Button>
                
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Target Framework</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={selectedFramework === 'react-native' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedFramework('react-native')}
                      className="w-full"
                    >
                      React Native
                    </Button>
                    <Button
                      variant={selectedFramework === 'flutter' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedFramework('flutter')}
                      className="w-full"
                    >
                      Flutter
                    </Button>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Describe your app or paste Figma URL..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendPrompt();
                      }
                    }}
                    className="min-h-[80px] resize-none"
                    disabled={isGenerating}
                  />
                  <Button
                    onClick={() => handleSendPrompt()}
                    disabled={isGenerating || !prompt.trim()}
                    size="icon"
                    className="h-[80px] w-12 shrink-0"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <PublishModal
        open={showPublishModal}
        onOpenChange={setShowPublishModal}
      />
      
      <IntegrationsModal
        open={showIntegrationsModal}
        onOpenChange={setShowIntegrationsModal}
      />
    </div>
  );
};

export default Dashboard;
