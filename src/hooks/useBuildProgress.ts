import { useState, useEffect, useCallback } from 'react';
import { buildService } from '@/api/buildService';
import { toast } from 'react-toastify';

export function useBuildProgress(buildId: string) {
  const [status, setStatus] = useState('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const statusLabels: Record<string, string> = {
    idle: 'Idle',
    queued: 'Queued',
    planning: 'Planning',
    generating: 'Generating Code',
    building: 'Building',
    packaging: 'Packaging',
    uploading: 'Uploading',
    completed: 'Completed',
    failed: 'Failed',
  };

  const statusEmojis: Record<string, string> = {
    queued: '⏳',
    planning: '🧠',
    generating: '🏗️',
    building: '⚙️',
    packaging: '📦',
    uploading: '☁️',
    completed: '✅',
    failed: '❌',
  };

  const handleUpdate = useCallback((data: any) => {
    setStatus(data.status);
    setProgress(data.progress || 0);

    if (data.status === 'completed') {
      toast.success(`✅ Build completed!`);
    } else if (data.status === 'failed') {
      toast.error(`❌ Build failed: ${data.error || 'Unknown error'}`);
    }
  }, []);

  const handleError = useCallback((err: any) => {
    setError(err.message || 'Unknown error');
    toast.error(`❌ Build error: ${err.message}`);
  }, []);

  useEffect(() => {
    if (!buildId || isSubscribed) return;

    setIsSubscribed(true);
    buildService.subscribeToBuild(buildId, handleUpdate, handleError);

    return () => {
      buildService.unsubscribe(buildId);
      setIsSubscribed(false);
    };
  }, [buildId, isSubscribed, handleUpdate, handleError]);

  const refresh = useCallback(async () => {
    if (!buildId) return;
    try {
      const data = await buildService.getBuildStatus(buildId);
      handleUpdate(data);
    } catch (err: any) {
      handleError(err);
    }
  }, [buildId, handleUpdate, handleError]);

  return {
    status,
    progress,
    error,
    statusLabel: statusLabels[status] || status,
    statusEmoji: statusEmojis[status] || '📱',
    isCompleted: status === 'completed',
    isFailed: status === 'failed',
    isInProgress: !['idle', 'completed', 'failed'].includes(status),
    refresh,
  };
}
