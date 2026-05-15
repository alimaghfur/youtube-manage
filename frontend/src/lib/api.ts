const API_BASE = "http://localhost:8000/api";

export async function fetchAPI(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(error.detail || `API Error: ${res.status}`);
  }
  return res.json();
}

// --- Stats ---
export const getStats = () => fetchAPI("/stats");
export const getHealth = () => fetchAPI("/health");

// --- Generate ---
export const startGeneration = (data: {
  keyword: string;
  niche: string;
  video_type: string;
  language: string;
  voice_engine: string;
  duration_target: string;
}) => fetchAPI("/generate/", { method: "POST", body: JSON.stringify(data) });

export const getProgress = (videoId: number) => fetchAPI(`/generate/progress/${videoId}`);

// --- Library ---
export const getVideos = (status?: string) =>
  fetchAPI(`/library/${status ? `?status=${status}` : ""}`);
export const getVideo = (id: number) => fetchAPI(`/library/${id}`);
export const deleteVideo = (id: number) =>
  fetchAPI(`/library/${id}`, { method: "DELETE" });
export const updateVideo = (id: number, data: Record<string, string>) =>
  fetchAPI(`/library/${id}`, { method: "PUT", body: JSON.stringify(data) });

// --- Scheduler ---
export const getSchedules = () => fetchAPI("/scheduler/schedules");
export const createSchedule = (data: { upload_time: string; days: string[] }) =>
  fetchAPI("/scheduler/schedules", { method: "POST", body: JSON.stringify(data) });
export const updateSchedule = (id: number, data: { upload_time: string; days: string[] }) =>
  fetchAPI(`/scheduler/schedules/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteSchedule = (id: number) =>
  fetchAPI(`/scheduler/schedules/${id}`, { method: "DELETE" });
export const getQueue = () => fetchAPI("/scheduler/queue");
export const addToQueue = (data: { video_id: number; scheduled_date: string; scheduled_time: string }) =>
  fetchAPI("/scheduler/queue", { method: "POST", body: JSON.stringify(data) });
export const removeFromQueue = (id: number) =>
  fetchAPI(`/scheduler/queue/${id}`, { method: "DELETE" });
export const getNextUpload = () => fetchAPI("/scheduler/next");

// --- Upload ---
export const uploadVideo = (data: {
  video_id: number;
  title: string;
  description: string;
  tags: string;
  category: string;
  visibility: string;
}) => fetchAPI("/upload/", { method: "POST", body: JSON.stringify(data) });
export const getReadyVideos = () => fetchAPI("/upload/ready");

// --- Settings ---
export const getSettings = () => fetchAPI("/settings/");
export const updateSetting = (key: string, value: string) =>
  fetchAPI("/settings/", { method: "PUT", body: JSON.stringify({ key, value }) });
export const updateSettingsBulk = (settings: Record<string, string>) =>
  fetchAPI("/settings/bulk", { method: "PUT", body: JSON.stringify(settings) });
export const getApiHealth = () => fetchAPI("/settings/health");
