const API_BASE = import.meta.env.PROD
    ? "/api"
    : "http://localhost:3000/api";

type RequestOptions = Omit<RequestInit, 'body'> & {
    body?: unknown;
};

export const fetchWithAuth = async (endpoint: string, options: RequestOptions = {}) => {
    const headers: HeadersInit = {
        "Content-Type": "application/json",
        ...(options.headers || {}),
    };

    const { body, ...restOptions } = options;

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...restOptions,
        headers,
        credentials: "include",
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || response.statusText || "An API error occurred");
    }

    return response.json();
};

export const api = {
    // URLs / Monitors
    getMonitors: () => fetchWithAuth("/urls"),
    addMonitor: (url: string, checkIntervalHours: number) => fetchWithAuth("/urls", {
        method: "POST",
        body: { url, checkIntervalHours }
    }),
    deleteMonitor: (id: string) => fetchWithAuth(`/urls/${id}`, { method: "DELETE" }),

    // Snapshot history
    getSnapshots: (urlId: string) => fetchWithAuth(`/urls/${urlId}/snapshots`),

    // Auth
    getMe: () => fetchWithAuth("/auth/me"),
};
