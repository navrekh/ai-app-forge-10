import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Smartphone, Send, Download, Settings, Home, FolderOpen, History, Loader2, Sparkles, RotateCw, Upload, Github } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { PhoneMockup } from "@/components/PhoneMockup";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { PublishModal } from "@/components/PublishModal";

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
  const [buildProgress, setBuildProgress] = useState(0);
  const [buildStatus, setBuildStatus] = useState<'idle' | 'generating' | 'building' | 'completed'>('idle');
  const [showPublishModal, setShowPublishModal] = useState(false);
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
    <div className="h-screen flex flex-col bg-background">
      {/* Top Header */}
      <header className="h-16 border-b bg-card flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary shadow-lg">
            <Smartphone className="h-5 w-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold">AppDev</h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowPublishModal(true)}>
            <Upload className="w-4 h-4 mr-2" />
            Publish
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/projects')}>
            <FolderOpen className="w-4 h-4 mr-2" />
            Projects
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/profile')}>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-64 border-r bg-card p-4 flex flex-col gap-4">
          <Button variant="ghost" className="justify-start" onClick={() => navigate('/')}>
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
          <Button variant="ghost" className="justify-start" onClick={() => navigate('/projects')}>
            <FolderOpen className="w-4 h-4 mr-2" />
            My Projects
          </Button>
          <Button variant="ghost" className="justify-start" onClick={() => navigate('/builds-history')}>
            <History className="w-4 h-4 mr-2" />
            Build History
          </Button>

          {buildStatus !== 'idle' && (
            <Card className="p-4 mt-auto">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">Build Progress</span>
                  <span className="text-muted-foreground">{buildProgress}%</span>
                </div>
                <Progress value={buildProgress} />
                <p className="text-xs text-muted-foreground capitalize">{buildStatus}</p>
              </div>
            </Card>
          )}
        </aside>

        {/* Center Preview Area */}
        <main className="flex-1 flex flex-col items-center justify-center bg-muted/20 p-8">
          <div className="mb-6 flex gap-3">
            <Button onClick={handleDownloadAPK} disabled={buildStatus !== 'completed'}>
              <Download className="w-4 h-4 mr-2" />
              Download APK
            </Button>
            <Button onClick={handleDownloadIPA} disabled={buildStatus !== 'completed'}>
              <Download className="w-4 h-4 mr-2" />
              Download IPA
            </Button>
          </div>

          {isGenerating ? (
            <div className="text-center space-y-6">
              <RotateCw className="w-16 h-16 mx-auto animate-spin text-primary" />
              <div className="space-y-2">
                <p className="text-lg font-medium">Generating your app...</p>
                <p className="text-sm text-muted-foreground">{buildStatus === 'generating' ? 'Creating UI components' : 'Building app files'}</p>
              </div>
            </div>
          ) : (
            <PhoneMockup>
              <div className="h-full bg-gradient-to-br from-primary/5 to-accent/5 p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-foreground">{previewContent.title}</h2>
                    <div className="w-10 h-10 rounded-full bg-primary" />
                  </div>
                  
                  <div className="space-y-3 mt-8">
                    {previewContent.screens.map((screen, idx) => (
                      <div key={idx} className="bg-card rounded-xl p-4 shadow-sm border">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Smartphone className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="font-semibold text-foreground">{screen}</div>
                            <div className="text-sm text-muted-foreground">Ready to use</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {buildStatus === 'idle' && (
                    <div className="text-center py-12">
                      <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Start by describing your app idea</p>
                    </div>
                  )}
                </div>
              </div>
            </PhoneMockup>
          )}
        </main>

        {/* Right Chat Panel */}
        <aside className="w-96 border-l bg-card flex flex-col">
          <div className="p-4 border-b">
            <h2 className="font-semibold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Assistant
            </h2>
            <p className="text-xs text-muted-foreground mt-1">Describe your app or paste Figma URL</p>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : message.role === 'system'
                        ? 'bg-muted text-muted-foreground text-sm'
                        : 'bg-accent text-accent-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendPrompt();
                  }
                }}
                placeholder="Describe your app or paste Figma URL..."
                className="resize-none"
                rows={3}
                disabled={isGenerating}
              />
              <Button
                onClick={() => handleSendPrompt()}
                disabled={isGenerating || !prompt.trim()}
                size="icon"
                className="h-full"
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </Button>
            </div>
          </div>
        </aside>
      </div>

      {/* Publish Modal */}
      <PublishModal open={showPublishModal} onOpenChange={setShowPublishModal} />
    </div>
  );
};

export default Dashboard;
