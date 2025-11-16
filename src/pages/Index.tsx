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
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 relative overflow-hidden">
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
                    <Button onClick={() => navigate('/dashboard')} variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/10 hover:text-white">
                      Dashboard
                    </Button>
                    <Button onClick={() => navigate('/profile')} variant="ghost" size="sm" className="text-white hover:bg-white/10 hover:text-white">
                      Profile
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => navigate('/auth')} variant="outline" size="sm" className="text-white border-white/30 hover:bg-white/10 hover:text-white">
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
                className="w-full h-16 text-lg bg-white text-purple-600 hover:bg-white/90 shadow-xl font-semibold hover:scale-105 transition-transform"
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
            <div className="flex justify-center gap-12 items-end">
              {/* Left Phone - React Native */}
              <div className="transform hover:scale-105 transition-all duration-500 hover:rotate-2 relative animate-fade-in" style={{ animationDelay: '0.1s' }}>
                {/* Hand holding phone */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[280px] h-[140px] bg-gradient-to-br from-amber-200 to-amber-300 rounded-t-full opacity-80 shadow-xl" 
                     style={{ clipPath: 'ellipse(50% 100% at 50% 100%)' }}>
                  {/* Thumb */}
                  <div className="absolute top-8 -left-8 w-16 h-20 bg-gradient-to-br from-amber-200 to-amber-300 rounded-full transform -rotate-45 shadow-lg" />
                </div>
                <div className="relative z-10">
                  <PhoneMockup>
                    <div className="h-full bg-gradient-to-br from-cyan-50 to-blue-50 flex items-center justify-center p-6">
                      <div className="text-center space-y-6">
                        <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl transform hover:rotate-12 transition-transform">
                          <svg viewBox="0 0 24 24" className="w-20 h-20 text-white">
                            <path fill="currentColor" d="M12 10.11c1.03 0 1.87.84 1.87 1.89 0 1-.84 1.85-1.87 1.85S10.13 13 10.13 12c0-1.05.84-1.89 1.87-1.89M7.37 20c.63.38 2.01-.2 3.6-1.7-.52-.59-1.03-1.23-1.51-1.9a22.7 22.7 0 0 1-2.4-.36c-.51 2.14-.32 3.61.31 3.96m.71-5.74-.29-.51c-.11.29-.22.58-.29.86.27.06.57.11.88.16l-.3-.51m6.54-.76.81-1.5-.81-1.5c-.3-.53-.62-1-.91-1.47C13.17 9 12.6 9 12 9s-1.17 0-1.71.03c-.29.47-.61.94-.91 1.47L8.57 12l.81 1.5c.3.53.62 1 .91 1.47.54.03 1.11.03 1.71.03s1.17 0 1.71-.03c.29-.47.61-.94.91-1.47M12 6.78c-.19.22-.39.45-.59.72h1.18c-.2-.27-.4-.5-.59-.72m0 10.44c.19-.22.39-.45.59-.72h-1.18c.2.27.4.5.59.72M16.62 4c-.62-.38-2 .2-3.59 1.7.52.59 1.03 1.23 1.51 1.9.82.08 1.63.2 2.4.36.51-2.14.32-3.61-.32-3.96m-.7 5.74.29.51c.11-.29.22-.58.29-.86-.27-.06-.57-.11-.88-.16l.3.51m1.45-7.05c1.47.84 1.63 3.05 1.01 5.63 2.54.75 4.37 1.99 4.37 3.68s-1.83 2.93-4.37 3.68c.62 2.58.46 4.79-1.01 5.63-1.46.84-3.45-.12-5.37-1.95-1.92 1.83-3.91 2.79-5.38 1.95-1.46-.84-1.62-3.05-1-5.63-2.54-.75-4.37-1.99-4.37-3.68s1.83-2.93 4.37-3.68c-.62-2.58-.46-4.79 1-5.63 1.47-.84 3.46.12 5.38 1.95 1.92-1.83 3.91-2.79 5.37-1.95M17.08 12c.34.75.64 1.5.89 2.26 2.1-.63 3.28-1.53 3.28-2.26s-1.18-1.63-3.28-2.26c-.25.76-.55 1.51-.89 2.26M6.92 12c-.34-.75-.64-1.5-.89-2.26-2.1.63-3.28 1.53-3.28 2.26s1.18 1.63 3.28 2.26c.25-.76.55-1.51.89-2.26m9.06 0c.45-1.29.72-2.57.79-3.76-.85-.09-1.76-.14-2.77-.14s-1.92.05-2.77.14c.07 1.19.34 2.47.79 3.76.45 1.29.72 2.57.79 3.76.85.09 1.76.14 2.77.14s1.92-.05 2.77-.14c-.07-1.19-.34-2.47-.79-3.76-.45-1.29-.72-2.57-.79-3.76z"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold text-gray-800 mb-2">React Native</h3>
                          <p className="text-sm text-gray-600">Build native apps with React</p>
                        </div>
                      </div>
                    </div>
                  </PhoneMockup>
                </div>
              </div>

              {/* Center Phone - Flutter */}
              <div className="transform hover:scale-105 transition-all duration-500 hover:rotate-2 scale-110 relative animate-fade-in" style={{ animationDelay: '0.2s' }}>
                {/* Hand holding phone */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[300px] h-[150px] bg-gradient-to-br from-amber-200 to-amber-300 rounded-t-full opacity-80 shadow-xl" 
                     style={{ clipPath: 'ellipse(50% 100% at 50% 100%)' }}>
                  {/* Thumb */}
                  <div className="absolute top-10 -left-10 w-18 h-22 bg-gradient-to-br from-amber-200 to-amber-300 rounded-full transform -rotate-45 shadow-lg" />
                </div>
                <div className="relative z-10">
                  <PhoneMockup>
                    <div className="h-full bg-gradient-to-br from-blue-50 to-sky-50 flex items-center justify-center p-6">
                      <div className="text-center space-y-6">
                        <div className="w-32 h-32 mx-auto rounded-3xl bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center shadow-2xl transform hover:rotate-12 transition-transform">
                          <svg viewBox="0 0 24 24" className="w-20 h-20 text-white">
                            <path fill="currentColor" d="M14.3 0L8.1 6.2l3.9 3.9L20.2 2zM2.1 7.2L.2 9.1c-.3.3-.3.8 0 1.1L9.1 19l1.9-1.9-8.9-9.9zm12.2 4.8l-3.9 3.9 6.2 6.2 8.1-8.1-10.4-2zm-6.2 6.2L2 24h8.1l6.2-6.2-3.9-3.9z"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold text-gray-800 mb-2">Flutter</h3>
                          <p className="text-sm text-gray-600">Beautiful native experiences</p>
                        </div>
                      </div>
                    </div>
                  </PhoneMockup>
                </div>
              </div>

              {/* Right Phone - Node.js */}
              <div className="transform hover:scale-105 transition-all duration-500 hover:rotate-2 relative animate-fade-in" style={{ animationDelay: '0.3s' }}>
                {/* Hand holding phone */}
                <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[280px] h-[140px] bg-gradient-to-br from-amber-200 to-amber-300 rounded-t-full opacity-80 shadow-xl" 
                     style={{ clipPath: 'ellipse(50% 100% at 50% 100%)' }}>
                  {/* Thumb */}
                  <div className="absolute top-8 -left-8 w-16 h-20 bg-gradient-to-br from-amber-200 to-amber-300 rounded-full transform -rotate-45 shadow-lg" />
                </div>
                <div className="relative z-10">
                  <PhoneMockup>
                    <div className="h-full bg-white flex items-center justify-center p-6">
                      <div className="text-center space-y-6">
                        <div className="w-32 h-32 mx-auto rounded-3xl bg-[#539E43] flex items-center justify-center shadow-2xl transform hover:rotate-12 transition-transform">
                          <svg viewBox="0 0 256 289" className="w-24 h-24">
                            <path fill="#FFFFFF" d="M128 288.464c-3.975 0-7.685-1.06-11.13-2.915l-35.247-20.936c-5.3-2.915-2.65-3.975-1.06-4.505 7.155-2.385 8.48-2.915 15.9-7.155.796-.53 1.856-.265 2.65.265l27.032 16.166c1.06.53 2.385.53 3.18 0l105.74-61.217c1.06-.53 1.59-1.326 1.59-2.385V83.08c0-1.06-.53-2.12-1.59-2.65l-105.74-60.953c-1.06-.53-2.385-.53-3.18 0L20.405 80.43c-1.06.53-1.59 1.855-1.59 2.65v122.17c0 1.06.53 2.12 1.59 2.65l28.887 16.695c15.636 7.95 25.44-1.326 25.44-10.6V93.68c0-1.59 1.326-3.18 3.18-3.18h13.516c1.59 0 3.18 1.326 3.18 3.18v120.58c0 20.936-11.396 33.126-31.272 33.126-6.095 0-10.865 0-24.38-6.625l-27.827-15.9C4.24 220.885 0 213.465 0 205.515V83.346C0 75.396 4.24 67.976 11.13 64L116.87 2.783c6.625-3.71 15.635-3.71 22.26 0L244.87 64C251.76 67.976 256 75.13 256 83.08v122.17c0 7.95-4.24 15.37-11.13 19.345L139.13 285.55c-3.445 1.59-7.42 2.915-11.13 2.915zm32.596-84.009c-46.377 0-55.917-21.2-55.917-39.221 0-1.59 1.326-3.18 3.18-3.18h13.78c1.59 0 2.916 1.06 2.916 2.65 2.12 14.045 8.215 20.936 36.306 20.936 22.26 0 31.803-5.035 31.803-16.96 0-6.891-2.65-11.926-37.367-15.372-28.887-2.915-46.907-9.275-46.907-32.33 0-21.467 18.02-34.186 48.232-34.186 33.921 0 50.617 11.66 52.737 37.101 0 .795-.265 1.59-.795 2.385-.53.53-1.326 1.06-2.12 1.06h-13.78c-1.326 0-2.65-1.06-2.916-2.385-3.18-14.575-11.395-19.345-33.126-19.345-24.38 0-27.296 8.48-27.296 14.84 0 7.686 3.445 10.07 36.306 14.31 32.597 4.24 47.967 10.336 47.967 33.127-.265 23.321-19.345 36.571-53.002 36.571z"/>
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-3xl font-bold text-gray-800 mb-2">Node.js</h3>
                          <p className="text-sm text-gray-600">JavaScript runtime for backend</p>
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
