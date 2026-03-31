import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Globe } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export default function Overview() {
    const { data: monitors = [], isLoading } = useQuery({
        queryKey: ['monitors'],
        queryFn: api.getMonitors
    });

    const activeCount = monitors.filter((m: any) => m.isActive).length;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
                <p className="text-muted-foreground mt-2">Welcome back to Watchlane. Here's a summary of your monitored URLs.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="transition-all hover:shadow-md hover:-translate-y-1 bg-gradient-to-br from-card to-muted/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Monitors</CardTitle>
                        <Globe className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? '-' : monitors.length}</div>
                    </CardContent>
                </Card>
                <Card className="transition-all hover:shadow-md hover:-translate-y-1 bg-gradient-to-br from-card to-muted/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Monitors</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{isLoading ? '-' : activeCount}</div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
