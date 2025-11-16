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
              {/* Left Phone */}
              <div className="transform md:translate-y-8 opacity-90">
                <PhoneMockup>
                  <div className="h-full bg-background p-6 flex flex-col">
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-foreground">$33,600</div>
                      <div className="text-sm text-muted-foreground">Total Portfolio</div>
                    </div>
                    <div className="flex-1 bg-primary/10 rounded-2xl p-4 mb-4">
                      <svg className="w-full h-32" viewBox="0 0 100 50">
                        <path d="M 0,40 Q 25,20 50,30 T 100,25" stroke="currentColor" fill="none" strokeWidth="2" className="text-primary" />
                      </svg>
                    </div>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20" />
                            <div className="text-xs font-medium">Investment {i}</div>
                          </div>
                          <div className="text-xs font-bold">${(i * 234).toFixed(2)}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </PhoneMockup>
              </div>

              {/* Center Phone */}
              <div className="transform md:scale-110 shadow-2xl">
                <PhoneMockup>
                  <div className="h-full bg-background p-6 flex flex-col">
                    <div className="text-xl font-bold mb-6">Investment Options</div>
                    <div className="flex-1 space-y-4">
                      {[
                        { name: 'US Treasury Bill', rate: '5.3%' },
                        { name: 'US Treasury Bill', rate: '5.2%' },
                        { name: 'US Treasury Bill', rate: '5.1%' },
                        { name: 'US Treasury Bill', rate: '5.0%' }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Smartphone className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="text-sm font-medium">{item.name}</div>
                              <div className="text-xs text-muted-foreground">{item.rate}</div>
                            </div>
                          </div>
                          <Button size="sm" className="h-8">
                            Buy
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </PhoneMockup>
              </div>

              {/* Right Phone */}
              <div className="transform md:translate-y-8 opacity-90">
                <PhoneMockup>
                  <div className="h-full bg-background p-6 flex flex-col">
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-foreground">$341,448</div>
                      <div className="text-sm text-muted-foreground">AppDev Balance</div>
                    </div>
                    <div className="flex justify-center gap-2 mb-6">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xs">
                          {i}
                        </div>
                      ))}
                    </div>
                    <div className="flex-1 space-y-4">
                      <div className="p-4 bg-muted/30 rounded-xl">
                        <div className="text-sm font-medium mb-2">Buying Power</div>
                        <div className="text-2xl font-bold">$88,350.00</div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Your Holdings</div>
                        {[1, 2].map((i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/20" />
                              <span className="text-xs">T-Bill {i}</span>
                            </div>
                            <span className="text-xs font-bold">${i * 1234}</span>
                          </div>
                        ))}
                      </div>
                    </div>
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
