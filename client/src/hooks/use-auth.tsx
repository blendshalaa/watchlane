import { authClient } from "@/lib/auth-client";

export function useAuth() {
    const { data: session, isPending: isLoading, error, refetch } = authClient.useSession();

    const isAuthenticated = !!session?.user;

    return {
        user: session?.user || null,
        isLoading,
        error,
        isAuthenticated,
        refetch
    };
}
