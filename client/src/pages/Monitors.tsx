import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Trash2, Plus, ExternalLink, ActivitySquare } from 'lucide-react';

export default function Monitors() {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newUrl, setNewUrl] = useState('');
    const [interval, setInterval] = useState(6);

    const { data: monitors = [], isLoading } = useQuery({
        queryKey: ['monitors'],
        queryFn: api.getMonitors
    });

    const addMutation = useMutation({
        mutationFn: () => api.addMonitor(newUrl, interval),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['monitors'] });
            setIsDialogOpen(false);
            setNewUrl('');
            toast.success('Monitor added successfully');
        },
        onError: (err: Error) => {
            toast.error(`Failed to add: ${err.message}`);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => api.deleteMonitor(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['monitors'] });
            toast.success('Monitor deleted');
        }
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newUrl) return;
        addMutation.mutate();
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Monitors</h1>
                    <p className="text-muted-foreground mt-1">Manage your watched URLs and their check intervals.</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    {/* @ts-expect-error Shadcn generic polymorphism discrepancy */}
                    <DialogTrigger asChild>
                        <Button className="gap-2"><Plus className="w-4 h-4" /> Add Monitor</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add a new monitor</DialogTitle>
                            <DialogDescription>
                                We will scrape this URL periodically and alert you of changes.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAdd} className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="url">Target URL</Label>
                                <Input
                                    id="url"
                                    placeholder="https://competitor.com/pricing"
                                    value={newUrl}
                                    onChange={e => setNewUrl(e.target.value)}
                                    required
                                    type="url"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="interval">Check Interval (Hours)</Label>
                                <Input
                                    id="interval"
                                    type="number"
                                    min="1"
                                    max="168"
                                    value={interval}
                                    onChange={e => setInterval(parseInt(e.target.value))}
                                    required
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" disabled={addMutation.isPending}>
                                    {addMutation.isPending ? 'Adding...' : 'Add Monitor'}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="border border-border rounded-md bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>URL</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Interval</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground animate-pulse">Loading monitors...</TableCell></TableRow>
                        ) : monitors.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4}>
                                    <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground border border-dashed rounded-lg bg-muted/10 mx-4 my-8">
                                        <ActivitySquare className="h-12 w-12 opacity-50 mb-4 text-primary" />
                                        <h3 className="text-lg font-medium text-foreground">No monitors mapped</h3>
                                        <p className="mt-1 max-w-sm text-sm">You aren't tracking any competitor URLs yet. Add your first domain target above!</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            monitors.map((m: any) => (
                                <TableRow key={m.id}>
                                    <TableCell className="font-medium">
                                        <a href={m.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:underline">
                                            {m.url}
                                            <ExternalLink className="w-3 h-3 text-muted-foreground" />
                                        </a>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={m.isActive ? "default" : "secondary"}>
                                            {m.isActive ? "Active" : "Paused"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>Every {m.checkIntervalHours}h</TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => deleteMutation.mutate(m.id)}
                                            disabled={deleteMutation.isPending}
                                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
