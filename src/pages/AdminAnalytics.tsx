import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TrendingUp, Users, Zap, Package } from "lucide-react";

interface AnalyticsData {
  totalUsers: number;
  totalAppsGenerated: number;
  totalApkBuilds: number;
  totalIpaBuilds: number;
  completionRate: number;
  revenueFromAI: number;
  revenueFromAPK: number;
  revenueFromIPA: number;
  totalRevenue: number;
}

export default function AdminAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Get total users
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Get app generation stats
      const { data: aiTransactions } = await supabase
        .from('credits_transactions')
        .select('*')
        .eq('description', 'AI app generation');

      // Get APK build stats
      const { data: apkTransactions } = await supabase
        .from('credits_transactions')
        .select('*')
        .eq('description', 'APK build');

      // Get IPA build stats
      const { data: ipaTransactions } = await supabase
        .from('credits_transactions')
        .select('*')
        .eq('description', 'IPA build');

      // Get total apps generated
      const { count: appsGenerated } = await supabase
        .from('app_history')
        .select('*', { count: 'exact', head: true });

      // Get total builds
      const { count: totalBuilds } = await supabase
        .from('builds')
        .select('*', { count: 'exact', head: true });

      const totalAppsGenerated = appsGenerated || 0;
      const totalApkBuilds = apkTransactions?.length || 0;
      const totalIpaBuilds = ipaTransactions?.length || 0;
      
      // Calculate completion rate (apps that got at least one build)
      const completionRate = totalAppsGenerated > 0 
        ? ((totalApkBuilds + totalIpaBuilds) / totalAppsGenerated) * 100 
        : 0;

      // Calculate revenue (credits = ₹20 each)
      const revenueFromAI = (aiTransactions?.length || 0) * 10 * 20; // 10 credits * ₹20
      const revenueFromAPK = totalApkBuilds * 5 * 20; // 5 credits * ₹20
      const revenueFromIPA = totalIpaBuilds * 5 * 20; // 5 credits * ₹20

      setAnalytics({
        totalUsers: userCount || 0,
        totalAppsGenerated,
        totalApkBuilds,
        totalIpaBuilds,
        completionRate,
        revenueFromAI,
        revenueFromAPK,
        revenueFromIPA,
        totalRevenue: revenueFromAI + revenueFromAPK + revenueFromIPA
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Admin Analytics</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="container mx-auto p-6">
        <p className="text-muted-foreground">Failed to load analytics</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Analytics</h1>
        <p className="text-muted-foreground">Track credit usage patterns and conversion rates</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalUsers}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Apps Generated</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.totalAppsGenerated}</div>
            <p className="text-xs text-muted-foreground">10 credits each</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Builds</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.totalApkBuilds + analytics.totalIpaBuilds}
            </div>
            <p className="text-xs text-muted-foreground">
              APK: {analytics.totalApkBuilds} | IPA: {analytics.totalIpaBuilds}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.completionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Apps that got built</p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Breakdown</CardTitle>
            <CardDescription>Total credits spent converted to revenue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">AI Generation (10 credits)</span>
              <span className="text-lg font-bold">₹{analytics.revenueFromAI.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">APK Builds (5 credits)</span>
              <span className="text-lg font-bold">₹{analytics.revenueFromAPK.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">IPA Builds (5 credits)</span>
              <span className="text-lg font-bold">₹{analytics.revenueFromIPA.toLocaleString()}</span>
            </div>
            <div className="pt-4 border-t flex justify-between items-center">
              <span className="font-semibold">Total Revenue</span>
              <span className="text-2xl font-bold text-primary">
                ₹{analytics.totalRevenue.toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Credit Usage Funnel</CardTitle>
            <CardDescription>User journey and drop-off analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Apps Generated</span>
                <span className="text-sm font-medium">{analytics.totalAppsGenerated}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div className="bg-primary h-2 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">APK Builds</span>
                <span className="text-sm font-medium">{analytics.totalApkBuilds}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ 
                    width: analytics.totalAppsGenerated > 0 
                      ? `${(analytics.totalApkBuilds / analytics.totalAppsGenerated) * 100}%` 
                      : '0%' 
                  }} 
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">IPA Builds</span>
                <span className="text-sm font-medium">{analytics.totalIpaBuilds}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full" 
                  style={{ 
                    width: analytics.totalAppsGenerated > 0 
                      ? `${(analytics.totalIpaBuilds / analytics.totalAppsGenerated) * 100}%` 
                      : '0%' 
                  }} 
                />
              </div>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>{((analytics.totalAppsGenerated - analytics.totalApkBuilds - analytics.totalIpaBuilds) > 0 
                  ? analytics.totalAppsGenerated - Math.max(analytics.totalApkBuilds, analytics.totalIpaBuilds)
                  : 0)}
                </strong> apps generated but never built (drop-off)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            <p className="text-sm">
              <strong>{analytics.completionRate.toFixed(1)}%</strong> of generated apps proceed to build stage
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            <p className="text-sm">
              Average revenue per user: <strong>₹{analytics.totalUsers > 0 ? (analytics.totalRevenue / analytics.totalUsers).toFixed(0) : 0}</strong>
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            <p className="text-sm">
              Users spend <strong>10 credits (₹200)</strong> on AI generation regardless of build completion
            </p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 rounded-full bg-primary mt-2" />
            <p className="text-sm">
              Complete cross-platform app costs <strong>20 credits (₹400)</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
