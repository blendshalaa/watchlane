import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Login() {
    const [key, setKey] = useState('');
    const { setApiKey } = useAuth();
    const navigate = useNavigate();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!key.trim()) {
            toast.error('Please enter a valid API Key');
            return;
        }
        setApiKey(key.trim());
        toast.success('Successfully logged in');
        navigate('/overview');
    };

    return (
        <div className="flex bg-background items-center justify-center min-h-svh w-full p-4">
            <Card className="w-full max-w-sm">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Watchlane</CardTitle>
                    <CardDescription>Enter your API key to access your dashboard.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="apiKey">API Key</Label>
                            <Input
                                id="apiKey"
                                type="password"
                                placeholder="wl_xxxxxxxxxxxxxxx"
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full">Sign In</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
