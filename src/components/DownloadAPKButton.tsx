import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DownloadAPKButtonProps {
  projectId: string;
  disabled?: boolean;
}

export const DownloadAPKButton = ({ projectId, disabled }: DownloadAPKButtonProps) => {
  const [building, setBuilding] = useState(false);
  const [buildId, setBuildId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('idle');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    if (!buildId || status === 'completed' || status === 'failed') return;

    const interval = setInterval(async () => {
      try {
        const { data, error } = await supabase.functions.invoke('check-build-status', {
          body: { buildId },
        });

        if (error) throw error;

        console.log('Build status:', data.status);
        setStatus(data.status);

        if (data.status === 'completed') {
          setDownloadUrl(data.downloadUrl);
          toast.success('APK build completed!');
          clearInterval(interval);
        } else if (data.status === 'failed') {
          toast.error('Build failed: ' + (data.errorMessage || 'Unknown error'));
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error checking build status:', error);
        clearInterval(interval);
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [buildId, status]);

  const handleBuild = async () => {
    try {
      setBuilding(true);
      setShowDialog(true);
      setStatus('pending');
      
      const { data, error } = await supabase.functions.invoke('create-apk-build', {
        body: { projectId },
      });

      if (error) throw error;

      setBuildId(data.buildId);
      setStatus(data.status);
      toast.success('Build started! This may take a few minutes...');
    } catch (error) {
      console.error('Error starting build:', error);
      toast.error('Failed to start build');
      setBuilding(false);
      setShowDialog(false);
    }
  };

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
      setShowDialog(false);
      setBuilding(false);
      setStatus('idle');
      setBuildId(null);
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
                We're packaging your app with all its components and assets.
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
              <Button
                onClick={() => {
                  setShowDialog(false);
                  setBuilding(false);
                  setStatus('idle');
                }}
                variant="outline"
              >
                Close
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
