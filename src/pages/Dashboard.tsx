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
    setBuildStatus('generating');
    setBuildProgress(10);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        role: 'assistant',
        content: `I'm generating your app based on: "${messageContent}". Creating screens, components, and navigation...`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setBuildProgress(40);
    }, 1000);

    // Simulate build progress
    setTimeout(() => {
      setBuildStatus('building');
      setBuildProgress(70);
      setPreviewContent({
        title: messageContent.split(' ').slice(0, 3).join(' ') || 'My App',
        screens: ['Home', 'Details', 'Profile']
      });
    }, 3000);

    setTimeout(() => {
      setBuildStatus('completed');
      setBuildProgress(100);
      setIsGenerating(false);
      
      const completeMessage: Message = {
        role: 'assistant',
        content: '✅ Your app is ready! You can now preview it on the phone screen and download the APK/IPA files.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, completeMessage]);
      toast.success('App generated successfully!');
    }, 5000);
  };

  const handleDownloadAPK = () => {
    toast.info('Building APK file...');
    setTimeout(() => {
      toast.success('APK ready for download!');
    }, 2000);
  };

  const handleDownloadIPA = () => {
    toast.info('Building IPA file...');
    setTimeout(() => {
      toast.success('IPA ready for download!');
    }, 2000);
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
            <Button variant="ghost" size="icon" onClick={() => setShowIntegrationsModal(true)}>
              <Plug className="w-5 h-5" />
            </Button>
            <Button 
              onClick={() => setShowPublishModal(true)}
              variant="default"
              size="sm"
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              Publish
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/projects')}>
              <FileText className="w-5 h-5" />
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
                >
                  <Download className="w-4 h-4" />
                  Download APK
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
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
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary animate-pulse" />
                  AI Assistant
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setMessages([messages[0]])} className="hover:bg-primary/10 transition-all">
                  <RotateCw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
              </div>

              <ScrollArea className="flex-1 pr-4 mb-4">
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                          message.role === 'user'
                            ? 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground'
                            : message.role === 'system'
                            ? 'bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground border border-primary/20'
                            : 'bg-gradient-to-br from-muted to-muted/80 border border-primary/10'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        <p className="text-xs opacity-70 mt-2">
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isGenerating && (
                    <div className="flex justify-start animate-fade-in">
                      <div className="bg-gradient-to-br from-muted to-muted/80 rounded-2xl p-4 border border-primary/10">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          <span className="text-sm text-muted-foreground">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              <div className="space-y-3">
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
                  className="min-h-[100px] resize-none border-primary/20 focus-visible:ring-primary/20 bg-background/50"
                  disabled={isGenerating}
                />
                <Button
                  onClick={() => handleSendPrompt()}
                  disabled={isGenerating || !prompt.trim()}
                  className="w-full group transition-all hover:scale-[1.02]"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2 group-hover:translate-x-1 transition-transform" />
                      Send Message
                    </>
                  )}
                </Button>
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
