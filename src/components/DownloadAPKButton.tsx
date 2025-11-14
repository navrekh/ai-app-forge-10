import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { BACKEND_API } from "@/config/backend";

interface DownloadAPKButtonProps {
  appHistoryId: string;
  disabled?: boolean;
}

export const DownloadAPKButton = ({ appHistoryId, disabled }: DownloadAPKButtonProps) => {
  const [building, setBuilding] = useState(false);
  const [buildId, setBuildId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('idle');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (!buildId || status === 'completed' || status === 'failed') return;

    const interval = setInterval(async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const headers = {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        };
        const response = await fetch(BACKEND_API.BASE_URL + BACKEND_API.BUILD_STATUS(buildId), { headers });
        
        if (!response.ok) {
          throw new Error(`Failed to check build status: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Build status:', data.status);
        setStatus(data.status);

        if (data.status === 'completed') {
          setDownloadUrl(data.downloadUrl);
          setBuilding(false);
          toast.success(`${data.platform === 'ios' ? 'IPA' : 'APK'} build completed!`);
          clearInterval(interval);
        } else if (data.status === 'failed') {
          setErrorMessage(data.errorMessage || 'Unknown error');
          setBuilding(false);
          toast.error('Build failed: ' + (data.errorMessage || 'Unknown error'));
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error checking build status:', error);
        toast.error('Failed to check build status');
        clearInterval(interval);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [buildId, status]);

  const handleBuild = async () => {
    try {
      setBuilding(true);
      setShowDialog(true);
      setStatus('pending');
      setErrorMessage(null);
      
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Authentication required');
        setBuilding(false);
        setShowDialog(false);
        return;
      }

      const headers = {
        'Authorization': `Bearer ${session.access_token}`,
        'Content-Type': 'application/json',
      };
      const response = await fetch(BACKEND_API.BASE_URL + BACKEND_API.BUILD_APK, {
        method: 'POST',
        headers,
        body: JSON.stringify({ 
          appHistoryId,
          platform: 'android' 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to start build: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.buildId) {
        setBuildId(data.buildId);
        setStatus(data.status || 'pending');
        toast.success('Build started! This may take 10-30 minutes...');
      } else {
        throw new Error('No build ID returned from server');
      }
    } catch (error) {
      console.error('Error starting build:', error);
      const errorMsg = error instanceof Error ? error.message : 'Failed to start build';
      toast.error(errorMsg);
      setErrorMessage(errorMsg);
      setBuilding(false);
      setShowDialog(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
      toast.success('APK download started!');
      setShowDialog(false);
      setBuilding(false);
      setStatus('idle');
      setBuildId(null);
      setDownloadUrl(null);
      setErrorMessage(null);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'pending':
        return <Loader2 className="h-8 w-8 animate-spin text-primary" />;
      case 'building':
        return <Loader2 className="h-8 w-8 animate-spin text-primary" />;
      case 'completed':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-8 w-8 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'pending':
        return 'Preparing build...';
      case 'building':
        return 'Building APK...';
      case 'completed':
        return 'Build completed!';
      case 'failed':
        return 'Build failed';
      default:
        return '';
    }
  };

  return (
    <>
      <Button
        onClick={handleBuild}
        disabled={disabled || building}
        variant="outline"
        className="flex-1"
      >
        {building && status !== 'completed' ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Download className="mr-2 h-4 w-4" />
        )}
        Download APK
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Building Android APK</DialogTitle>
            <DialogDescription>
              Your app is being built for Android. This process may take a few minutes.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            {getStatusIcon()}
            <p className="text-lg font-medium">{getStatusText()}</p>
            
            {status === 'building' && (
              <p className="text-sm text-muted-foreground text-center">
                Building via Expo EAS Build. This typically takes 10-30 minutes.
                You'll be notified when it's ready.
              </p>
            )}

            {status === 'completed' && downloadUrl && (
              <Button onClick={handleDownload} className="mt-4">
                <Download className="mr-2 h-4 w-4" />
                Download APK
              </Button>
            )}

            {status === 'failed' && (
              <div className="space-y-3">
                {errorMessage && (
                  <p className="text-sm text-muted-foreground text-center">
                    {errorMessage}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    onClick={handleBuild}
                    variant="outline"
                  >
                    Retry
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDialog(false);
                      setBuilding(false);
                      setStatus('idle');
                      setErrorMessage(null);
                    }}
                    variant="outline"
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
