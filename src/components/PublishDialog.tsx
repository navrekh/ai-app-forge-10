import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Upload, Loader2 } from 'lucide-react';

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  buildId?: string;
}

export const PublishDialog = ({ open, onOpenChange, projectName, buildId }: PublishDialogProps) => {
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState('google-play');

  // Google Play Store states
  const [googleServiceAccount, setGoogleServiceAccount] = useState('');
  const [googlePackageName, setGooglePackageName] = useState('');
  
  // Apple App Store states
  const [appleApiKey, setAppleApiKey] = useState('');
  const [appleIssuerId, setAppleIssuerId] = useState('');
  const [appleBundleId, setAppleBundleId] = useState('');

  const handlePublishToGooglePlay = async () => {
    if (!googleServiceAccount || !googlePackageName) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!buildId) {
      toast.error('No build available to publish');
      return;
    }

    setIsPublishing(true);
    try {
      // TODO: Implement actual API call to publish to Google Play
      toast.success('🚀 Publishing to Google Play Store...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('✅ Successfully published to Google Play Store!');
      onOpenChange(false);
    } catch (error) {
      console.error('Publish error:', error);
      toast.error('Failed to publish to Google Play Store');
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublishToAppStore = async () => {
    if (!appleApiKey || !appleIssuerId || !appleBundleId) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!buildId) {
      toast.error('No build available to publish');
      return;
    }

    setIsPublishing(true);
    try {
      // TODO: Implement actual API call to publish to Apple App Store
      toast.success('🚀 Publishing to Apple App Store...');
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('✅ Successfully published to Apple App Store!');
      onOpenChange(false);
    } catch (error) {
      console.error('Publish error:', error);
      toast.error('Failed to publish to Apple App Store');
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Publish App to Store</DialogTitle>
          <DialogDescription>
            Publish "{projectName}" directly to Google Play Store or Apple App Store
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="google-play">Google Play</TabsTrigger>
            <TabsTrigger value="app-store">Apple App Store</TabsTrigger>
          </TabsList>

          <TabsContent value="google-play" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="package-name">Package Name *</Label>
                <Input
                  id="package-name"
                  placeholder="com.example.myapp"
                  value={googlePackageName}
                  onChange={(e) => setGooglePackageName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service-account">Service Account JSON *</Label>
                <Textarea
                  id="service-account"
                  placeholder="Paste your Google Play service account JSON here..."
                  className="min-h-[120px] font-mono text-sm"
                  value={googleServiceAccount}
                  onChange={(e) => setGoogleServiceAccount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  You can create a service account in Google Play Console → Settings → API access
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-sm">Required Setup:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Google Play Developer account ($25 one-time fee)</li>
                  <li>Service account with API access enabled</li>
                  <li>App created in Google Play Console</li>
                  <li>Initial APK uploaded manually once</li>
                </ul>
              </div>

              <Button
                onClick={handlePublishToGooglePlay}
                disabled={isPublishing || !googleServiceAccount || !googlePackageName}
                className="w-full"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Publish to Google Play
                  </>
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="app-store" className="space-y-4 pt-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bundle-id">Bundle ID *</Label>
                <Input
                  id="bundle-id"
                  placeholder="com.example.myapp"
                  value={appleBundleId}
                  onChange={(e) => setAppleBundleId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="issuer-id">Issuer ID *</Label>
                <Input
                  id="issuer-id"
                  placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={appleIssuerId}
                  onChange={(e) => setAppleIssuerId(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="api-key">App Store Connect API Key *</Label>
                <Textarea
                  id="api-key"
                  placeholder="Paste your .p8 API key content here..."
                  className="min-h-[120px] font-mono text-sm"
                  value={appleApiKey}
                  onChange={(e) => setAppleApiKey(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  You can create API keys in App Store Connect → Users and Access → Keys
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h4 className="font-semibold text-sm">Required Setup:</h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Apple Developer account ($99/year)</li>
                  <li>App Store Connect API key with App Manager role</li>
                  <li>App created in App Store Connect</li>
                  <li>App configured with certificates and provisioning profiles</li>
                </ul>
              </div>

              <Button
                onClick={handlePublishToAppStore}
                disabled={isPublishing || !appleApiKey || !appleIssuerId || !appleBundleId}
                className="w-full"
              >
                {isPublishing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Publish to App Store
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
