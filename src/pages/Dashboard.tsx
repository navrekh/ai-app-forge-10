import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Smartphone, Send, Download, Settings, Home, FolderOpen, History, Loader2, Sparkles, RotateCw, Upload, Plug, Zap, Palette } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { PhoneMockup } from "@/components/PhoneMockup";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { PublishModal } from "@/components/PublishModal";
import { IntegrationsModal } from "@/components/IntegrationsModal";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-md sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-3 sm:px-6 py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 sm:gap-8">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg">
                  <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
                </div>
                <h1 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
                  AppDev Studio
                </h1>
              </div>
              <nav className="hidden md:flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="hover:bg-primary/10 transition-all">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/projects')} className="hover:bg-primary/10 transition-all">
                  <FolderOpen className="w-4 h-4 mr-2" />
                  Projects
                </Button>
                <Button variant="ghost" size="sm" onClick={() => navigate('/builds-history')} className="hover:bg-primary/10 transition-all">
                  <History className="w-4 h-4 mr-2" />
                  History
                </Button>
              </nav>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setShowPublishModal(true)}
                disabled={buildStatus !== 'completed'}
                variant="default"
                size="sm"
                className="transition-all hover:scale-[1.02] hidden sm:flex"
              >
                <Upload className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Publish</span>
              </Button>
              <Button 
                onClick={() => setShowPublishModal(true)}
                disabled={buildStatus !== 'completed'}
                variant="default"
                size="icon"
                className="sm:hidden transition-all hover:scale-[1.02]"
              >
                <Upload className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setShowIntegrationsModal(true)} className="hover:bg-primary/10 transition-all">
                <Plug className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate('/user-profile')} className="hover:bg-primary/10 transition-all">
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Left Sidebar - Build Progress */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="p-6 border-primary/20 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Build Progress
                </h3>
                {buildStatus !== 'idle' && (
                  <Badge variant="secondary" className="animate-pulse">
                    Active
                  </Badge>
                )}
              </div>
              {buildStatus !== 'idle' && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className="font-medium capitalize text-primary">{buildStatus}</span>
                  </div>
                  <div className="space-y-2">
                    <Progress value={buildProgress} className="h-3 bg-secondary" />
                    <p className="text-sm text-muted-foreground text-right font-medium">
                      {buildProgress}%
                    </p>
                  </div>
                </div>
              )}
              {buildStatus === 'idle' && (
                <div className="text-center py-8 space-y-3">
                  <div className="w-16 h-16 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <Palette className="w-8 h-8 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Start by describing your app idea...
                  </p>
                </div>
              )}
            </Card>
          </div>

          {/* Center - Preview Area */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <Card className="p-4 sm:p-6 border-primary/20 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold flex items-center gap-2">
                  <Smartphone className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  App Preview
                </h3>
                <Select value={selectedFramework} onValueChange={(value: 'react-native' | 'flutter') => setSelectedFramework(value)}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Select framework" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="react-native">React Native</SelectItem>
                    <SelectItem value="flutter">Flutter</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-center mb-4 sm:mb-6 animate-fade-in">
                <div className="relative scale-90 sm:scale-100">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-purple-600/20 blur-3xl rounded-full" />
                  <PhoneMockup>
                    <div className="p-4 sm:p-6 h-full bg-gradient-to-b from-primary/10 via-transparent to-purple-600/5">
                      <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        {previewContent.title}
                      </h2>
                      <div className="space-y-2 sm:space-y-3">
                        {previewContent.screens.map((screen, index) => (
                          <div 
                            key={index} 
                            className="p-3 sm:p-4 bg-card/80 backdrop-blur rounded-xl border border-primary/20 shadow-sm hover:shadow-md transition-all hover:scale-[1.02] animate-fade-in text-sm sm:text-base"
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            {screen}
                          </div>
                        ))}
                      </div>
                    </div>
                  </PhoneMockup>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <Button
                  onClick={handleDownloadAPK}
                  disabled={buildStatus !== 'completed'}
                  className="w-full group transition-all hover:scale-[1.02]"
                  size="sm"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 group-hover:animate-bounce" />
                  <span className="text-xs sm:text-sm">APK</span>
                </Button>
                <Button
                  onClick={handleDownloadIPA}
                  disabled={buildStatus !== 'completed'}
                  variant="outline"
                  className="w-full group transition-all hover:scale-[1.02] border-primary/20"
                  size="sm"
                >
                  <Download className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 group-hover:animate-bounce" />
                  <span className="text-xs sm:text-sm">IPA</span>
                </Button>
              </div>
            </Card>
          </div>

          {/* Right Sidebar - Chat Interface */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6">
            <Card className="p-4 sm:p-6 h-[calc(100vh-180px)] sm:h-[calc(100vh-200px)] flex flex-col border-primary/20 shadow-lg bg-gradient-to-br from-card to-card/50 backdrop-blur">
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
