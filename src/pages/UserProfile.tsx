import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, User, Mail, Calendar, Loader2, Save, Smartphone, Package, CheckCircle } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

interface Stats {
  totalGenerations: number;
  totalBuilds: number;
  successfulBuilds: number;
}

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [fullName, setFullName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [stats, setStats] = useState<Stats>({ totalGenerations: 0, totalBuilds: 0, successfulBuilds: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/firebase-auth');
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.uid)
          .single();

        if (error) throw error;
        
        setProfile(data);
        setFullName(data.full_name || '');
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    const fetchStats = async () => {
      try {
        // Get total generations
        const { count: generationsCount } = await supabase
          .from('app_history')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.uid);

        // Get total builds
        const { count: buildsCount } = await supabase
          .from('builds')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.uid);

        // Get successful builds
        const { count: successfulCount } = await supabase
          .from('builds')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.uid)
          .eq('status', 'completed');

        setStats({
          totalGenerations: generationsCount || 0,
          totalBuilds: buildsCount || 0,
          successfulBuilds: successfulCount || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoadingStats(false);
      }
    };

    fetchProfile();
    fetchStats();
  }, [user, navigate]);

  const handleSaveProfile = async () => {
    if (!user || !profile) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName || null })
        .eq('id', user.uid);

      if (error) throw error;

      toast.success('Profile updated successfully!');
      setProfile({ ...profile, full_name: fullName });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/firebase-auth');
  };

  if (loading || !user || !profile) {
    return (
      <div className="min-h-screen gradient-hero flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
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

      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-8 max-w-4xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">User Profile</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Manage your account information and view your statistics
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Profile Information */}
          <Card className="shadow-card">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <User className="h-4 sm:h-5 w-4 sm:w-5" />
                Profile Information
              </CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Update your personal information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-4 sm:p-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    disabled
                    className="flex-1"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Email cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label>Member Since</Label>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(profile.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving || fullName === (profile.full_name || '')}
                  className="w-full sm:w-auto"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card className="shadow-card">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Usage Statistics</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Overview of your app generations and builds
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {loadingStats ? (
                <div className="text-center py-8">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
                  <div className="bg-primary/5 rounded-lg p-3 sm:p-4 border border-primary/10">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg flex-shrink-0">
                        <Smartphone className="h-4 sm:h-5 w-4 sm:w-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xl sm:text-2xl font-bold">{stats.totalGenerations}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">Apps Generated</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-accent/5 rounded-lg p-3 sm:p-4 border border-accent/10">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-accent/10 rounded-lg flex-shrink-0">
                        <Package className="h-4 sm:h-5 w-4 sm:w-5 text-accent" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xl sm:text-2xl font-bold">{stats.totalBuilds}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">Total Builds</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-500/5 rounded-lg p-3 sm:p-4 border border-green-500/10">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="p-1.5 sm:p-2 bg-green-500/10 rounded-lg flex-shrink-0">
                        <CheckCircle className="h-4 sm:h-5 w-4 sm:w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xl sm:text-2xl font-bold">{stats.successfulBuilds}</p>
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">Successful Builds</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card className="shadow-card border-destructive/20">
            <CardHeader>
              <CardTitle className="text-destructive">Account Actions</CardTitle>
              <CardDescription>
                Manage your account settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                onClick={handleLogout}
                className="w-full sm:w-auto"
              >
                Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
