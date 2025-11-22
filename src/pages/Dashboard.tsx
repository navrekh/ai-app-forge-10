import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Smartphone, Send, Download, Settings, Upload, Github, FileText, Plus, LogOut } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { PhonePreview } from "@/components/PhonePreview";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PublishModal } from "@/components/PublishModal";
import { IntegrationsModal } from "@/components/IntegrationsModal";
import { NavLink } from "@/components/NavLink";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import type { User, Session } from '@supabase/supabase-js';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Account created! Please check your email to confirm.');
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Signed in successfully!');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success('Signed out successfully!');
  };

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

    // Simulate AI response and update live preview based on the prompt
    setTimeout(() => {
      const assistantMessage: Message = {
        role: 'assistant',
        content: `I'm generating your app based on: "${messageContent}". Creating screens, components, and navigation...`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsGenerating(false);
      
      const shortTitle = messageContent.length > 35
        ? `${messageContent.slice(0, 32)}...`
        : messageContent || 'My App';

      setPreviewContent({
        title: shortTitle,
        screens: [
          'Home Screen',
          'Details Screen',
          'Profile Screen'
        ]
      });
      
      toast.success('App preview updated!');
    }, 1500);
  };

  const handleDownloadAPK = () => {
    toast.info('APK download will be available after app generation');
  };

  const handleDownloadIPA = () => {
    toast.info('IPA download will be available after app generation');
  };

  const resetDashboard = () => {
    setPrompt('');
    setMessages([
      {
        role: 'system',
        content: 'Welcome to AppDev! Describe your app idea or paste a Figma URL to get started.',
        timestamp: new Date()
      }
    ]);
    setIsGenerating(false);
    setSelectedFramework('react-native');
    setPreviewContent({
      title: 'My App',
      screens: ['Welcome Screen']
    });
  };

  // Show authentication form if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-md p-8">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
              <Smartphone className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold">AppDev</h1>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Creating account...' : 'Sign Up'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    );
  }

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
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="shrink-0">
              <CreditsDisplay />
            </div>
            
            <Button 
              onClick={() => {
                resetDashboard();
                navigate('/');
              }}
              variant="outline"
              size="sm"
              className="gap-2 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Project</span>
            </Button>

            <Button
              onClick={() => setSelectedFramework('react-native')}
              variant={selectedFramework === 'react-native' ? 'default' : 'outline'}
              size="sm"
              className="gap-2 bg-[hsl(var(--react-native))] hover:bg-[hsl(var(--react-native))]/90 text-white border-0"
              style={selectedFramework === 'react-native' ? {} : { background: 'transparent', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))' }}
            >
              React Native
            </Button>

            <Button
              onClick={() => setSelectedFramework('flutter')}
              variant={selectedFramework === 'flutter' ? 'default' : 'outline'}
              size="sm"
              className="gap-2 bg-[hsl(var(--flutter))] hover:bg-[hsl(var(--flutter))]/90 text-white border-0"
              style={selectedFramework === 'flutter' ? {} : { background: 'transparent', color: 'hsl(var(--foreground))', border: '1px solid hsl(var(--border))' }}
            >
              Flutter
            </Button>

            <Button
              onClick={() => navigate('/figma-import')}
              size="sm"
              className="gap-2 bg-[hsl(var(--figma))] hover:bg-[hsl(var(--figma))]/90 text-white border-0"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Import Figma</span>
            </Button>
            
            <Button 
              onClick={() => setShowIntegrationsModal(true)}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Github className="w-4 h-4" />
              <span className="hidden sm:inline">GitHub</span>
            </Button>
            <Button 
              onClick={() => setShowPublishModal(true)}
              variant="default"
              size="sm"
              className="gap-2"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Publish</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={() => navigate('/projects')}>
              <FileText className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-5 h-5" />
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
                <PhonePreview isLoading={isGenerating}>
                  <div className="p-6 h-full bg-white">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">{previewContent.title}</h2>
                      <div className="w-12 h-12 rounded-full bg-blue-500" />
                    </div>
                    <div className="space-y-3">
                      {previewContent.screens.map((screen, index) => (
                        <Card key={index} className="p-4 bg-gray-50 border-gray-200">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg border-2 border-blue-200 flex items-center justify-center bg-white">
                              <Smartphone className="w-5 h-5 text-blue-500" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{screen}</p>
                              <p className="text-sm text-gray-600">Ready to use</p>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                    <div className="mt-8 text-center text-gray-500 text-sm">
                      <p>Start by describing your app idea</p>
                    </div>
                  </div>
                </PhonePreview>
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
                    size="icon"
                    disabled={isGenerating}
                    className="shrink-0 h-[80px] w-12"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <PublishModal open={showPublishModal} onOpenChange={setShowPublishModal} />
      <IntegrationsModal open={showIntegrationsModal} onOpenChange={setShowIntegrationsModal} />
    </div>
  );
};

export default Dashboard;
