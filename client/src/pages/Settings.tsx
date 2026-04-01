import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Settings() {
    const { user } = useAuth();

    const handleLogout = async () => {
        const API_BASE = import.meta.env.PROD ? "/api" : "http://localhost:3000/api";
        // We use a form-style POST to the Better Auth sign-out endpoint
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = `${API_BASE}/auth/logout`;
        document.body.appendChild(form);
        form.submit();
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account and authentication settings.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Profile</CardTitle>
                    <CardDescription>
                        Your personal information linked to Google.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                            <AvatarImage src={user?.image || ''} alt={user?.name || ''} />
                            <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="text-lg font-medium">{user?.name || 'Watchlane User'}</p>
                            <p className="text-sm text-muted-foreground">{user?.email}</p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button variant="destructive" onClick={handleLogout}>Log Out</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
