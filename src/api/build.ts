const API = import.meta.env.VITE_API_URL;

export async function startBuild(data: { projectName: string; prompt: string; screens: any[] }) {
  const res = await fetch(`${API}/api/build/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function getBuildStatus(buildId: string) {
  const res = await fetch(`${API}/api/build-status/${buildId}`);
  return res.json();
}
