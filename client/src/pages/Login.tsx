import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigate } from 'react-router-dom';

export default function Login() {
    const { isAuthenticated, isLoading } = useAuth();
    const [loginError, setLoginError] = useState<string | null>(null);
    const [isSigningIn, setIsSigningIn] = useState(false);

    if (isLoading) {
        return (
            <div className="flex bg-background items-center justify-center min-h-svh w-full p-4 text-muted-foreground animate-pulse">
                Loading...
            </div>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/overview" replace />;
    }

    const handleGoogleLogin = async () => {
        setLoginError(null);
        setIsSigningIn(true);
        try {
            const result = await authClient.signIn.social({
                provider: "google",
                callbackURL: "/overview",
            });

            if (result.error) {
                console.error("Better Auth sign-in error:", result.error);
                setLoginError(result.error.message || result.error.statusText || JSON.stringify(result.error));
                setIsSigningIn(false);
            }
            // If successful, Better Auth will redirect the browser automatically
        } catch (err: unknown) {
            console.error("Login exception:", err);
            const message = err instanceof Error ? err.message : JSON.stringify(err);
            setLoginError(message);
            setIsSigningIn(false);
        }
    };

    return (
        <div className="flex bg-background items-center justify-center min-h-svh w-full p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-center">Watchlane</CardTitle>
                    <CardDescription className="text-center">Securely monitor your competitors with automated alerts.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-4">
                    {loginError && (
                        <p className="text-sm text-center text-destructive bg-destructive/10 p-2 rounded-md">
                            {loginError}
                        </p>
                    )}
                    <Button
                        size="lg"
                        variant="default"
                        className="w-full font-semibold"
                        onClick={handleGoogleLogin}
                        disabled={isSigningIn}
                    >
                        {isSigningIn ? "Redirecting..." : "Sign in with Google"}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground">
                        Single Sign-On powered by Better Auth.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
