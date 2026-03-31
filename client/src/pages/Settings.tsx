import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Settings() {
    const { apiKey, setApiKey } = useAuth();

    const handleLogout = () => {
        setApiKey(null);
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account and authentication settings.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>API Key</CardTitle>
                    <CardDescription>
                        Your current API Key used for authenticating requests. Keep this private.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Current Key</Label>
                        <Input type="password" value={apiKey || ''} readOnly />
                    </div>
                </CardContent>
                <CardFooter className="border-t px-6 py-4">
                    <Button variant="destructive" onClick={handleLogout}>Log Out</Button>
                </CardFooter>
            </Card>
        </div>
    );
}
