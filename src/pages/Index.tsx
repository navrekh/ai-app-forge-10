import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import { Smartphone, Zap, Shield, Sparkles, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Index = () => {
  const navigate = useNavigate();
  const [user, loading] = useAuthState(auth);
  const hasFirebaseConfig = import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID;

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard');
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen gradient-hero">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary shadow-glow">
                <Smartphone className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold">MobileDev</h1>
            </div>
            <Button onClick={() => navigate('/auth')} variant="outline">
              Get Started
            </Button>
          </div>
        </div>
      </header>

      <main>
        {!hasFirebaseConfig && (
          <div className="container mx-auto px-4 pt-8">
            <Alert className="max-w-4xl mx-auto border-primary/50 bg-primary/5">
              <AlertCircle className="h-5 w-5 text-primary" />
              <AlertTitle className="text-lg font-semibold">Setup Required</AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-3">Firebase credentials are not configured. You have two options:</p>
                <div className="space-y-2 text-sm">
                  <p><strong>Option 1 (Recommended):</strong> Switch to Lovable Cloud - simpler setup, no external accounts needed</p>
                  <p><strong>Option 2:</strong> Configure Firebase credentials in your project settings</p>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">Ask me: "Switch to Lovable Cloud" or "Help me set up Firebase"</p>
              </AlertDescription>
            </Alert>
          </div>
        )}
        
        <section className="container mx-auto px-4 py-20 text-center">
          <div className="mx-auto max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              AI-Powered Mobile App Generation
            </div>
            
            <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl lg:text-7xl">
              Build Mobile Apps with{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AI Magic
              </span>
            </h1>
            
            <p className="mb-10 text-xl text-muted-foreground md:text-2xl">
              Describe your app idea and watch AI generate beautiful mobile interfaces in seconds.
              No coding required.
            </p>

            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button 
                size="lg" 
                className="gradient-primary shadow-glow text-lg"
                onClick={() => navigate('/auth')}
              >
                <Smartphone className="mr-2 h-5 w-5" />
                Start Creating
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/auth')}>
                Sign In
              </Button>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-16">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-card">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
                <Zap className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Generate complete mobile app interfaces in seconds, not weeks. AI handles the heavy lifting.
              </p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-card">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
                <Smartphone className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Mobile-First</h3>
              <p className="text-muted-foreground">
                Every generated app is optimized for mobile devices with beautiful, responsive designs.
              </p>
            </div>

            <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-card">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
                <Shield className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="mb-3 text-xl font-bold">Secure & Reliable</h3>
              <p className="text-muted-foreground">
                Your projects are safely stored and accessible anytime. Built with enterprise-grade security.
              </p>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/50 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          <p>© 2025 MobileDev. Generate mobile apps with AI.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
