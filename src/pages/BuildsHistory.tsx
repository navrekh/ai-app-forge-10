import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { ArrowLeft, Download, Loader2, Calendar, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface AppHistory {
  id: string;
  created_at: string;
  prompt: string;
  download_url: string | null;
  user_id: string | null;
}

interface Build {
  id: string;
  created_at: string;
  updated_at: string;
  status: string;
  platform: string;
  download_url: string | null;
  error_message: string | null;
  project_id: string;
  expo_build_id: string | null;
}

const BuildsHistory = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [appHistory, setAppHistory] = useState<AppHistory[]>([]);
  const [builds, setBuilds] = useState<Build[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/firebase-auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        // Fetch app generation history
        const { data: historyData, error: historyError } = await supabase
          .from('app_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (historyError) throw historyError;
        setAppHistory(historyData || []);

        // Fetch builds
        const { data: buildsData, error: buildsError } = await supabase
          .from('builds')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (buildsError) throw buildsError;
        setBuilds(buildsData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load history');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [user]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'building':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      completed: "default",
      failed: "destructive",
      pending: "secondary",
      building: "outline",
    };
    return (
      <Badge variant={variants[status] || "outline"} className="flex items-center gap-1">
        {getStatusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-hero">
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <Button variant="ghost" onClick={() => navigate('/dashboard')} size="sm" className="text-xs sm:text-sm">
            <ArrowLeft className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Builds History</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            View all your app generations and build statuses
          </p>
        </div>

        <Tabs defaultValue="generations" className="w-full">
          <TabsList className="grid w-full max-w-md grid-cols-2 text-xs sm:text-sm">
            <TabsTrigger value="generations" className="text-xs sm:text-sm px-2">
              <span className="hidden sm:inline">App Generations ({appHistory.length})</span>
              <span className="sm:hidden">Apps ({appHistory.length})</span>
            </TabsTrigger>
            <TabsTrigger value="builds" className="text-xs sm:text-sm px-2">
              <span className="hidden sm:inline">APK/IPA Builds ({builds.length})</span>
              <span className="sm:hidden">Builds ({builds.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generations" className="mt-6">
            {loadingData ? (
              <div className="text-center py-12">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              </div>
            ) : appHistory.length === 0 ? (
              <Card className="shadow-card text-center py-12">
                <CardContent className="pt-6">
                  <AlertCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No generations yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Start by generating your first mobile app
                  </p>
                  <Button onClick={() => navigate('/dashboard')}>
                    Generate Your First App
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {appHistory.map((app) => (
                  <Card key={app.id} className="shadow-card hover:shadow-glow transition-all">
                    <CardHeader className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-base sm:text-lg mb-2 line-clamp-2">
                            {app.prompt.slice(0, 60)}...
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2 text-xs sm:text-sm">
                            <Calendar className="h-3 sm:h-4 w-3 sm:w-4 flex-shrink-0" />
                            <span className="truncate">{new Date(app.created_at).toLocaleString()}</span>
                          </CardDescription>
                        </div>
                        {app.download_url && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(app.download_url!, '_blank')}
                            className="w-full sm:w-auto text-xs sm:text-sm flex-shrink-0"
                          >
                            <Download className="mr-1 sm:mr-2 h-3 sm:h-4 w-3 sm:w-4" />
                            <span className="hidden sm:inline">Download ZIP</span>
                            <span className="sm:hidden">Download</span>
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-4 sm:p-6 pt-0">
                      <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2">
                        {app.prompt}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="builds" className="mt-6">
            {loadingData ? (
              <div className="text-center py-12">
                <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              </div>
            ) : builds.length === 0 ? (
              <Card className="shadow-card text-center py-12">
                <CardContent className="pt-6">
                  <AlertCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No builds yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Generate an app first, then build APK or IPA files
                  </p>
                  <Button onClick={() => navigate('/dashboard')}>
                    Go to Dashboard
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {builds.map((build) => (
                  <Card key={build.id} className="shadow-card hover:shadow-glow transition-all">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <CardTitle className="text-lg">
                              {build.platform.toUpperCase()} Build
                            </CardTitle>
                            {getStatusBadge(build.status)}
                          </div>
                          <CardDescription className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Created: {new Date(build.created_at).toLocaleString()}
                          </CardDescription>
                          {build.updated_at !== build.created_at && (
                            <CardDescription className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Updated: {new Date(build.updated_at).toLocaleString()}
                            </CardDescription>
                          )}
                        </div>
                        {build.download_url && build.status === 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(build.download_url!, '_blank')}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download {build.platform.toUpperCase()}
                          </Button>
                        )}
                      </div>
                    </CardHeader>
                    {build.error_message && (
                      <CardContent>
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                          <p className="text-sm text-destructive font-medium mb-1">Build Error:</p>
                          <p className="text-xs text-destructive/80">{build.error_message}</p>
                        </div>
                      </CardContent>
                    )}
                    {build.expo_build_id && (
                      <CardContent>
                        <p className="text-xs text-muted-foreground">
                          Expo Build ID: <code className="bg-muted px-1 py-0.5 rounded">{build.expo_build_id}</code>
                        </p>
                      </CardContent>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default BuildsHistory;
