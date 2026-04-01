import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";

export function useAuth() {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: ["auth-me"],
        queryFn: () => api.getMe(),
        retry: false,
    });

    const isAuthenticated = !!data?.success && !!data.user;

    return {
        user: data?.user,
        isLoading,
        error,
        isAuthenticated,
        refetch
    };
}
