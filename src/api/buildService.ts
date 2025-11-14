const API_BASE = import.meta.env.VITE_API_URL;

class BuildService {
  private ws: WebSocket | null = null;
  private pollingInterval: NodeJS.Timeout | null = null;
  private listeners = new Map();

  async startBuild(data: { projectName: string; prompt: string; screens: any[] }) {
    const response = await fetch(`${API_BASE}/api/build/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Build start failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getBuildStatus(buildId: string) {
    const response = await fetch(`${API_BASE}/api/build-status/${buildId}`);

    if (!response.ok) {
      throw new Error(`Build status check failed: ${response.statusText}`);
    }

    return response.json();
  }

  subscribeToBuild(buildId: string, onUpdate: (data: any) => void, onError?: (error: any) => void) {
    this._startPolling(buildId, onUpdate, onError);
    this.listeners.set(buildId, { onUpdate, onError });
  }

  private _startPolling(buildId: string, onUpdate: (data: any) => void, onError?: (error: any) => void) {
    const poll = async () => {
      try {
        const data = await this.getBuildStatus(buildId);
        onUpdate(data);

        if (data.status === 'completed' || data.status === 'failed') {
          this.unsubscribe(buildId);
        }
      } catch (error) {
        onError?.(error);
      }
    };

    poll();
    this.pollingInterval = setInterval(poll, 3000);
  }

  unsubscribe(buildId: string) {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    this.listeners.delete(buildId);
  }

  async buildAPK(data: { appHistoryId: string; platform: string }) {
    const response = await fetch(`${API_BASE}/api/build-apk`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`APK build failed: ${response.statusText}`);
    }

    return response.json();
  }
}

export const buildService = new BuildService();
