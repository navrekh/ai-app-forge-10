import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Download, Clock, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from './ui/button';

interface HistoryEntry {
  id: string;
  prompt: string;
  download_url: string | null;
  zip_base64: string | null;
  created_at: string;
}

export const HistoryPanel = () => {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('app_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setHistory(data || []);
    } catch (error) {
      console.error('Failed to load history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (entry: HistoryEntry) => {
    if (entry.download_url) {
      window.open(entry.download_url, '_blank');
      toast.success('Opening download link...');
    } else if (entry.zip_base64) {
      try {
        const byteCharacters = atob(entry.zip_base64);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/zip' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'project.zip';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success('Download started');
      } catch (error) {
        console.error('Download failed:', error);
        toast.error('Failed to download');
      }
    }
  };

  const handleCopyUrl = (entry: HistoryEntry) => {
    const shareUrl = `${window.location.origin}/shared/${entry.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(entry.id);
    toast.success('Link copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="bg-card shadow-card rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Generation History
        </h3>
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-card shadow-card rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Generation History
        </h3>
        <p className="text-sm text-muted-foreground">No history yet. Generate your first app!</p>
      </div>
    );
  }

  return (
    <div className="bg-card shadow-card rounded-xl p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Clock className="h-4 w-4" />
        Generation History
      </h3>
      <div className="space-y-3 max-h-[600px] overflow-y-auto">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="bg-muted/50 rounded-lg p-4 space-y-3 hover:bg-muted transition-colors"
          >
            <p className="text-sm text-foreground line-clamp-2">
              {entry.prompt}
            </p>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{new Date(entry.created_at).toLocaleDateString()}</span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleCopyUrl(entry)}
                  className="h-8 px-2"
                >
                  {copiedId === entry.id ? (
                    <Check className="h-3 w-3" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDownload(entry)}
                  className="h-8 px-2"
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
