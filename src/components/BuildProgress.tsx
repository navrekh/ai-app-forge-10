import { useBuildProgress } from '@/hooks/useBuildProgress';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { RefreshCw, Download, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import './BuildProgress.css';

interface BuildProgressProps {
  buildId: string;
  onDownload?: () => void;
  onCancel?: () => void;
}

/**
 * BuildProgress Component
 * Displays real-time build progress with animations
 */
export function BuildProgress({ buildId, onDownload, onCancel }: BuildProgressProps) {
  const {
    status,
    progress,
    error,
    statusLabel,
    statusEmoji,
    isCompleted,
    isFailed,
    isInProgress,
    refresh,
  } = useBuildProgress(buildId);

  if (!buildId || status === 'idle') {
    return null;
  }

  return (
    <Card className="build-progress-card animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isInProgress && (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          )}
          {isCompleted && (
            <CheckCircle className="h-5 w-5 text-green-500 animate-scale-in" />
          )}
          {isFailed && (
            <XCircle className="h-5 w-5 text-red-500 animate-scale-in" />
          )}
          <span className="status-emoji">{statusEmoji}</span>
          Build Progress
        </CardTitle>
        <CardDescription>
          Build ID: <code className="text-xs">{buildId}</code>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Status Label */}
        <div className="status-label">
          <span className="text-sm font-medium">{statusLabel}</span>
          <span className="text-sm text-muted-foreground">{progress}%</span>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <Progress
            value={progress}
            className={`progress-bar ${isCompleted ? 'progress-complete' : ''} ${
              isFailed ? 'progress-failed' : ''
            }`}
          />
          {isInProgress && <div className="progress-glow" />}
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message animate-fade-in">
            <XCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {isCompleted && onDownload && (
            <Button onClick={onDownload} className="flex-1 hover-scale">
              <Download className="h-4 w-4 mr-2" />
              Download APK
            </Button>
          )}

          {isInProgress && onCancel && (
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel Build
            </Button>
          )}

          {(isCompleted || isFailed) && (
            <Button variant="outline" onClick={refresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
        </div>

        {/* Build Info */}
        <div className="build-info text-xs text-muted-foreground">
          <div>Status: {status}</div>
          <div>Progress: {progress}%</div>
          {isCompleted && <div className="text-green-500 font-medium">Build ready!</div>}
          {isFailed && <div className="text-red-500 font-medium">Build failed</div>}
        </div>
      </CardContent>
    </Card>
  );
}
