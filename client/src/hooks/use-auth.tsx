import { useState, useCallback } from "react";

export function useAuth() {
    const [apiKey, setApiKeyState] = useState<string | null>(() => localStorage.getItem("watchlane-api-key"));

    const setApiKey = useCallback((key: string | null) => {
        if (key) {
            localStorage.setItem("watchlane-api-key", key);
        } else {
            localStorage.removeItem("watchlane-api-key");
        }
        setApiKeyState(key);
    }, []);

    return { apiKey, setApiKey, isAuthenticated: !!apiKey };
}
