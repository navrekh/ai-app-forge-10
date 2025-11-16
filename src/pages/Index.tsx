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
            <div className="flex justify-center gap-8 items-center text-white/70 text-sm pt-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white" />
                  <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white" />
                  <div className="w-8 h-8 rounded-full bg-white/20 border-2 border-white" />
                </div>
                <span>10,000+ Creators</span>
              </div>
            </div>
          </div>

          {/* Phone Mockups with Hands */}
          <div className="relative pb-20">
            <div className="flex justify-center gap-8 items-end">
              {/* Left Phone - Fitness App */}
              <div className="transform hover:scale-105 transition-transform duration-300 relative">
                {/* Hand holding phone */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[280px] h-[140px] bg-gradient-to-br from-amber-200 to-amber-300 rounded-t-full opacity-80 shadow-xl" 
                     style={{ clipPath: 'ellipse(50% 100% at 50% 100%)' }}>
                  {/* Thumb */}
                  <div className="absolute top-8 -left-8 w-16 h-20 bg-gradient-to-br from-amber-200 to-amber-300 rounded-full transform -rotate-45 shadow-lg" />
                </div>
                <div className="relative z-10">
                  <PhoneMockup>
                    <div className="h-full bg-gradient-to-br from-green-50 to-emerald-50 p-6">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-2xl font-bold text-gray-800">FitTrack</h2>
                          <div className="w-12 h-12 rounded-full bg-green-500" />
                        </div>
                        <div className="bg-white rounded-2xl p-6 shadow-lg">
                          <div className="text-sm text-gray-600 mb-2">Today's Progress</div>
                          <div className="text-4xl font-bold text-green-600">8,547</div>
                          <div className="text-sm text-gray-600">steps</div>
                        </div>
                        <div className="space-y-3">
                          <div className="bg-white rounded-xl p-4 shadow">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">Calories</span>
                              <span className="font-semibold text-orange-600">342 kcal</span>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-4 shadow">
                            <div className="flex justify-between items-center">
                              <span className="text-gray-700">Distance</span>
                              <span className="font-semibold text-blue-600">6.2 km</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </PhoneMockup>
                </div>
              </div>

              {/* Center Phone - Social Media App */}
              <div className="transform hover:scale-105 transition-transform duration-300 scale-110 relative">
                {/* Hand holding phone */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[300px] h-[150px] bg-gradient-to-br from-amber-200 to-amber-300 rounded-t-full opacity-80 shadow-xl" 
                     style={{ clipPath: 'ellipse(50% 100% at 50% 100%)' }}>
                  {/* Thumb */}
                  <div className="absolute top-10 -left-10 w-18 h-22 bg-gradient-to-br from-amber-200 to-amber-300 rounded-full transform -rotate-45 shadow-lg" />
                </div>
                <div className="relative z-10">
                  <PhoneMockup>
                    <div className="h-full bg-gradient-to-br from-purple-50 to-pink-50 p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h2 className="text-2xl font-bold text-gray-800">ChatApp</h2>
                          <div className="w-10 h-10 rounded-full bg-purple-500" />
                        </div>
                        <div className="space-y-3">
                          {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white rounded-2xl p-4 shadow-lg flex items-center gap-3">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400" />
                              <div className="flex-1">
                                <div className="font-semibold text-gray-800">User {i}</div>
                                <div className="text-sm text-gray-500">Hey! How are you?</div>
                              </div>
                              <div className="text-xs text-gray-400">2m</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </PhoneMockup>
                </div>
              </div>

              {/* Right Phone - Task Management App */}
              <div className="transform hover:scale-105 transition-transform duration-300 relative">
                {/* Hand holding phone */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[280px] h-[140px] bg-gradient-to-br from-amber-200 to-amber-300 rounded-t-full opacity-80 shadow-xl" 
                     style={{ clipPath: 'ellipse(50% 100% at 50% 100%)' }}>
                  {/* Thumb */}
                  <div className="absolute top-8 -left-8 w-16 h-20 bg-gradient-to-br from-amber-200 to-amber-300 rounded-full transform -rotate-45 shadow-lg" />
                </div>
                <div className="relative z-10">
                  <PhoneMockup>
                    <div className="h-full bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between">
                          <h2 className="text-2xl font-bold text-gray-800">TaskFlow</h2>
                          <div className="w-12 h-12 rounded-full bg-blue-500" />
                        </div>
                        <div className="space-y-3">
                          <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-blue-500">
                            <div className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded border-2 border-blue-500 mt-1" />
                              <div className="flex-1">
                                <div className="font-semibold text-gray-800">Design new mockups</div>
                                <div className="text-sm text-gray-500">Due: Today</div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-green-500">
                            <div className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded border-2 border-green-500 flex items-center justify-center">
                                <div className="w-3 h-3 bg-green-500 rounded" />
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-800 line-through">Review PR</div>
                                <div className="text-sm text-gray-500">Completed</div>
                              </div>
                            </div>
                          </div>
                          <div className="bg-white rounded-xl p-4 shadow-lg border-l-4 border-orange-500">
                            <div className="flex items-start gap-3">
                              <div className="w-5 h-5 rounded border-2 border-orange-500 mt-1" />
                              <div className="flex-1">
                                <div className="font-semibold text-gray-800">Team meeting</div>
                                <div className="text-sm text-gray-500">Due: Tomorrow</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </PhoneMockup>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="max-w-4xl mx-auto mt-16">
            <div className="grid grid-cols-3 gap-8 text-center text-white">
              <div>
                <div className="text-4xl font-bold mb-2">50K+</div>
                <div className="text-white/80">Apps Created</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">10K+</div>
                <div className="text-white/80">Active Users</div>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">4.9★</div>
                <div className="text-white/80">User Rating</div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/10 py-8 text-center text-white/60 text-sm">
          <div className="container mx-auto px-6">
            <p>© 2024 AppDev. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;
