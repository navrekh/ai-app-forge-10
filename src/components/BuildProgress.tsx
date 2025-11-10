import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, XCircle, Clock } from 'lucide-react';

interface BuildProgressProps {
  status: 'idle' | 'generating' | 'building' | 'completed' | 'failed';
  progress: number;
  estimatedTime?: number;
  logs?: string[];
}

export const BuildProgress = ({ status, progress, estimatedTime, logs = [] }: BuildProgressProps) => {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    if (status === 'generating' || status === 'building') {
      const interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setElapsedTime(0);
    }
  }, [status]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (status) {
      case 'generating':
      case 'building':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-muted';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'generating':
      case 'building':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'failed':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'generating':
        return 'Generating app structure...';
      case 'building':
        return 'Building APK...';
      case 'completed':
        return 'Build completed successfully!';
      case 'failed':
        return 'Build failed';
      default:
        return 'Ready to build';
    }
  };

  if (status === 'idle') return null;

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`${getStatusColor()} text-white p-2 rounded-full`}>
            {getStatusIcon()}
          </div>
          <div>
            <p className="font-semibold">{getStatusText()}</p>
            <p className="text-sm text-muted-foreground">
              {status === 'generating' || status === 'building' ? (
                `Elapsed: ${formatTime(elapsedTime)}${estimatedTime ? ` / Est: ${formatTime(estimatedTime)}` : ''}`
              ) : null}
            </p>
          </div>
        </div>
        <Badge variant={status === 'completed' ? 'default' : status === 'failed' ? 'destructive' : 'secondary'}>
          {Math.round(progress)}%
        </Badge>
      </div>

      <Progress value={progress} className="h-2" />

      {logs.length > 0 && (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">Build Logs:</p>
          <div className="bg-muted rounded-lg p-4 max-h-40 overflow-y-auto">
            <pre className="text-xs space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="text-muted-foreground">
                  {log}
                </div>
              ))}
            </pre>
          </div>
        </div>
      )}
    </Card>
  );
};
