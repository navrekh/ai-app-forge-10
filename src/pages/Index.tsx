import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Smartphone, Sparkles, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { PhoneMockup } from '@/components/PhoneMockup';
import { toast } from 'sonner';


const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [appIdea, setAppIdea] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleStartCreating = () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    if (!appIdea.trim()) {
      toast.error('Please describe your app idea');
      return;
    }

    navigate('/dashboard', { state: { appIdea: appIdea.trim() } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary/95 to-primary/90 relative overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10">
        {/* Navigation */}
        <header className="border-b border-white/10 backdrop-blur-sm">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-lg">
                  <Smartphone className="h-5 w-5 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-white">AppDev</h1>
              </div>
              <nav className="hidden md:flex items-center gap-8">
                <button className="text-white/90 hover:text-white transition-colors text-sm font-medium">
                  Learn
                </button>
                <button onClick={() => navigate('/pricing')} className="text-white/90 hover:text-white transition-colors text-sm font-medium">
                  Pricing
                </button>
                <button onClick={() => navigate('/contact')} className="text-white/90 hover:text-white transition-colors text-sm font-medium">
                  Support
                </button>
              </nav>
              <div className="flex items-center gap-3">
                {user ? (
                  <>
                    <Button onClick={() => navigate('/dashboard')} variant="secondary" size="sm">
                      Dashboard
                    </Button>
                    <Button onClick={() => navigate('/profile')} variant="ghost" size="sm" className="text-white hover:bg-white/10">
                      Profile
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => navigate('/auth')} variant="secondary" size="sm">
                    Get the app
                  </Button>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center space-y-8 mb-16">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 text-white/90 text-sm font-medium">
              <Sparkles className="h-4 w-4" />
              THE #1 APP FOR AI APP GENERATION
              <Sparkles className="h-4 w-4" />
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              The easy way to build
              <br />
              Mobile Apps with AI
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
              That's how millions of smart creators build their apps. Stress-Free
            </p>

            {/* CTA Input */}
            <div className="max-w-2xl mx-auto space-y-4 pt-4">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="E.g., A fitness tracker with meal planning..."
                  value={appIdea}
                  onChange={(e) => setAppIdea(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleStartCreating();
                    }
                  }}
                  className="h-16 text-lg bg-white/95 border-0 shadow-xl"
                />
              </div>
              
              <Button 
                onClick={handleStartCreating}
                size="lg"
                className="w-full h-16 text-lg bg-white text-primary hover:bg-white/90 shadow-xl font-semibold"
              >
                Start Building Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-8 pt-8 text-white/90 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>No Coding Required</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span>Built with AI Technology</span>
              </div>
            </div>
          </div>

          {/* Phone Mockups */}
          <div className="relative max-w-5xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
              {/* Left Phone - Fitness App */}
              <div className="transform md:translate-y-8 opacity-90">
                <PhoneMockup>
                  <div className="h-full bg-gradient-to-b from-green-500/20 to-background p-6 flex flex-col">
                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-foreground mb-1">Daily Activity</div>
                      <div className="text-sm text-muted-foreground">Keep moving!</div>
                    </div>
                    
                    {/* Progress circles */}
                    <div className="flex justify-center gap-4 mb-6">
                      {[{ label: 'Move', value: '65%' }, { label: 'Exercise', value: '80%' }].map((item, i) => (
                        <div key={i} className="text-center">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center mb-1 shadow-lg">
                            <span className="text-white text-xs font-bold">{item.value}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">{item.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Stats cards */}
                    <div className="flex-1 space-y-3">
                      <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Steps Today</span>
                          <span className="text-xs text-muted-foreground">Goal: 10,000</span>
                        </div>
                        <div className="text-2xl font-bold text-green-600">8,432</div>
                        <div className="w-full bg-muted/30 rounded-full h-2 mt-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '84%' }} />
                        </div>
                      </div>
                      
                      <div className="p-3 bg-muted/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                            <span className="text-orange-600 text-sm">🔥</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">Calories Burned</div>
                            <div className="text-lg font-bold">425 kcal</div>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 bg-muted/30 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                            <span className="text-blue-600 text-sm">💧</span>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">Water Intake</div>
                            <div className="text-lg font-bold">6 / 8 glasses</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </PhoneMockup>
              </div>

              {/* Center Phone - Social Media App */}
              <div className="transform md:scale-110 shadow-2xl">
                <PhoneMockup>
                  <div className="h-full bg-background flex flex-col">
                    {/* Header */}
                    <div className="p-4 border-b border-border/50">
                      <div className="flex items-center justify-between">
                        <div className="text-xl font-bold">Messages</div>
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                          <span className="text-white text-xs font-bold">3</span>
                        </div>
                      </div>
                    </div>

                    {/* Search bar */}
                    <div className="px-4 py-3">
                      <div className="bg-muted/50 rounded-full px-4 py-2 flex items-center gap-2">
                        <svg className="w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <span className="text-sm text-muted-foreground">Search messages</span>
                      </div>
                    </div>

                    {/* Chat list */}
                    <div className="flex-1 overflow-hidden">
                      {[
                        { name: 'Sarah Johnson', msg: 'Hey! How are you?', time: '2m', avatar: '👩', unread: true },
                        { name: 'Mike Chen', msg: 'Thanks for the help!', time: '15m', avatar: '👨', unread: true },
                        { name: 'Team Alpha', msg: 'Meeting at 3 PM', time: '1h', avatar: '👥', unread: false },
                        { name: 'Emily Davis', msg: 'See you tomorrow 👋', time: '2h', avatar: '👧', unread: false },
                        { name: 'Project Group', msg: 'New updates available', time: '3h', avatar: '💼', unread: false }
                      ].map((chat, i) => (
                        <div key={i} className={`px-4 py-3 flex items-center gap-3 border-b border-border/30 ${chat.unread ? 'bg-primary/5' : ''}`}>
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl shadow-md">
                            {chat.avatar}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div className={`text-sm font-medium ${chat.unread ? 'text-foreground' : 'text-foreground/80'}`}>
                                {chat.name}
                              </div>
                              <div className="text-xs text-muted-foreground">{chat.time}</div>
                            </div>
                            <div className={`text-xs truncate ${chat.unread ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                              {chat.msg}
                            </div>
                          </div>
                          {chat.unread && (
                            <div className="w-2 h-2 rounded-full bg-primary" />
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Bottom nav */}
                    <div className="border-t border-border/50 p-2 flex justify-around">
                      {['💬', '👥', '📱', '👤'].map((icon, i) => (
                        <button key={i} className={`p-3 rounded-xl ${i === 0 ? 'bg-primary/10' : ''}`}>
                          <span className="text-xl">{icon}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </PhoneMockup>
              </div>

              {/* Right Phone - Task Management App */}
              <div className="transform md:translate-y-8 opacity-90">
                <PhoneMockup>
                  <div className="h-full bg-background p-6 flex flex-col">
                    <div className="mb-6">
                      <div className="text-2xl font-bold text-foreground mb-1">My Tasks</div>
                      <div className="text-sm text-muted-foreground">5 tasks remaining</div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-6 p-4 bg-primary/10 rounded-xl border border-primary/20">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Today's Progress</span>
                        <span className="text-sm font-bold text-primary">60%</span>
                      </div>
                      <div className="w-full bg-muted/30 rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '60%' }} />
                      </div>
                    </div>

                    {/* Task list */}
                    <div className="flex-1 space-y-3 overflow-hidden">
                      {[
                        { task: 'Design landing page', done: true, priority: 'high' },
                        { task: 'Review pull requests', done: true, priority: 'medium' },
                        { task: 'Update documentation', done: false, priority: 'low' },
                        { task: 'Team meeting at 2 PM', done: false, priority: 'high' },
                        { task: 'Deploy to production', done: false, priority: 'medium' }
                      ].map((item, i) => (
                        <div key={i} className={`p-3 rounded-xl border ${item.done ? 'bg-muted/30 border-border/30' : 'bg-card border-border/50'}`}>
                          <div className="flex items-start gap-3">
                            <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              item.done ? 'bg-primary border-primary' : 'border-muted-foreground/30'
                            }`}>
                              {item.done && (
                                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm ${item.done ? 'line-through text-muted-foreground' : 'text-foreground font-medium'}`}>
                                {item.task}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${
                                  item.priority === 'high' ? 'bg-red-500/20 text-red-600' :
                                  item.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-600' :
                                  'bg-blue-500/20 text-blue-600'
                                }`}>
                                  {item.priority}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add task button */}
                    <button className="mt-4 w-full p-3 bg-primary text-primary-foreground rounded-xl font-medium shadow-lg hover:bg-primary/90 transition-colors">
                      + Add New Task
                    </button>
                  </div>
                </PhoneMockup>
              </div>
            </div>

            {/* Shadow effect under phones */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-black/20 blur-3xl -z-10" />
          </div>

          {/* Statistics */}
          <div className="max-w-4xl mx-auto mt-24 grid grid-cols-3 gap-8 text-center text-white">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">10K+</div>
              <div className="text-white/80">Apps Created</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">5K+</div>
              <div className="text-white/80">Happy Users</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">30s</div>
              <div className="text-white/80">Avg Build Time</div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 mt-24">
          <div className="container mx-auto px-6 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/70">
              <div>© 2024 AppDev. All rights reserved.</div>
              <div className="flex gap-6">
                <button onClick={() => navigate('/terms')} className="hover:text-white transition-colors">
                  Terms
                </button>
                <button onClick={() => navigate('/privacy')} className="hover:text-white transition-colors">
                  Privacy
                </button>
                <button onClick={() => navigate('/contact')} className="hover:text-white transition-colors">
                  Contact
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
