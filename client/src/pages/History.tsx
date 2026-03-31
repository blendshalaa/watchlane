import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function History() {
    const [selectedMonitor, setSelectedMonitor] = useState<string>('');

    const { data: monitors = [] } = useQuery({
        queryKey: ['monitors'],
        queryFn: api.getMonitors
    });

    const { data: snapshots = [], isLoading: isLoadingSnapshots } = useQuery({
        queryKey: ['snapshots', selectedMonitor],
        queryFn: () => api.getSnapshots(selectedMonitor),
        enabled: !!selectedMonitor
    });

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Alert History</h1>
                <p className="text-muted-foreground mt-1">Review captured snapshots and detected text changes.</p>
            </div>

            <div className="w-full max-w-sm">
                <Select value={selectedMonitor} onValueChange={(val) => setSelectedMonitor(val || '')}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select a monitor" />
                    </SelectTrigger>
                    <SelectContent>
                        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                        {monitors.map((m: any) => (
                            <SelectItem key={m.id} value={m.id}>{m.url}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-4">
                {!selectedMonitor ? (
                    <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card shadow-sm">
                        Select a monitor above to view its history.
                    </div>
                ) : isLoadingSnapshots ? (
                    <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card shadow-sm">
                        Loading snapshots...
                    </div>
                ) : snapshots.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground border rounded-lg bg-card shadow-sm">
                        No snapshots recorded yet for this URL.
                    </div>
                ) : (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    snapshots.map((snap: any) => (
                        <Card key={snap.id}>
                            <CardHeader>
                                <CardTitle className="text-base">Changed on {new Date(snap.createdAt).toLocaleString()}</CardTitle>
                                <CardDescription>Snapshot ID: {snap.id.slice(0, 8)}...</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {snap.diff ? (
                                    <div className="rounded-md border border-border bg-card overflow-hidden shadow-inner text-sm font-mono overflow-x-auto">
                                        {snap.diff.split('\n').map((line: string, i: number) => {
                                            let className = 'px-4 py-1.5 whitespace-pre-wrap ';
                                            if (line.startsWith('+')) className += 'bg-green-500/10 text-green-600 dark:text-green-400 font-medium';
                                            else if (line.startsWith('-')) className += 'bg-red-500/10 text-red-600 dark:text-red-400 line-through opacity-80';
                                            else className += 'text-foreground/80';

                                            return <div key={i} className={className}>{line}</div>
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-muted-foreground border border-dashed rounded-md bg-muted/10">
                                        <p className="font-medium text-foreground">First Snapshot Recorded</p>
                                        <p className="text-sm mt-1">This initial text state was stored successfully. Future checks against this URL will generate text diffs beneath here.</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
