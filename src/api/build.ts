const API_BASE = import.meta.env.VITE_API_URL;

export async function startBuild(data: { projectName: string; prompt: string; screens: any[] }) {
  const res = await fetch(`${API_BASE}/api/build/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    throw new Error(`Build start failed: ${res.statusText}`);
  }
  
  return res.json();
}

export async function getBuildStatus(buildId: string) {
  const res = await fetch(`${API_BASE}/api/build-status/${buildId}`);
  
  if (!res.ok) {
    throw new Error(`Build status check failed: ${res.statusText}`);
  }
  
  return res.json();
}

export async function buildAPK(data: { appHistoryId: string; platform: string }) {
  const res = await fetch(`${API_BASE}/api/build-apk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    throw new Error(`APK build failed: ${res.statusText}`);
  }
  
  return res.json();
}
