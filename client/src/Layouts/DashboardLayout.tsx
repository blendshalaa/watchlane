import { Navigate, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Activity, LayoutDashboard, Settings as SettingsIcon, History } from 'lucide-react';
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
    SidebarInset,
} from '@/components/ui/sidebar';

const navigation = [
    { name: 'Overview', to: '/overview', icon: LayoutDashboard },
    { name: 'Monitors', to: '/monitors', icon: Activity },
    { name: 'History', to: '/history', icon: History },
    { name: 'Settings', to: '/settings', icon: SettingsIcon },
];

export default function DashboardLayout() {
    const { isAuthenticated, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background text-muted-foreground animate-pulse">
                Checking session...
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return (
        <SidebarProvider>
            <div className="flex h-screen w-full bg-background overflow-hidden">
                <Sidebar className="border-r border-border">
                    <SidebarHeader className="p-4 border-b border-border">
                        <Link to="/overview">
                            <h2 className="text-xl font-bold tracking-tight px-2">Watchlane</h2>
                        </Link>
                    </SidebarHeader>
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel>Application</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {navigation.map((item) => (
                                        <SidebarMenuItem key={item.name}>
                                            {/* @ts-expect-error Shadcn Radix polymorphism */}
                                            <SidebarMenuButton asChild isActive={location.pathname.startsWith(item.to)}>
                                                <Link to={item.to} className="flex items-center gap-3">
                                                    <item.icon className="w-4 h-4" />
                                                    <span>{item.name}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                </Sidebar>

                <SidebarInset className="flex w-full flex-col overflow-y-auto bg-muted/20">
                    <header className="sticky top-0 z-50 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/80 backdrop-blur-md px-4 shadow-sm">
                        <div className="flex items-center gap-2">
                            <SidebarTrigger className="-ml-1" />
                            <div className="hidden sm:block text-sm font-medium text-muted-foreground">
                                {navigation.find(n => location.pathname.startsWith(n.to))?.name || 'Dashboard'}
                            </div>
                        </div>
                    </header>
                    <main className="flex-1 p-6 sm:p-8">
                        <div className="mx-auto w-full max-w-6xl">
                            <Outlet />
                        </div>
                    </main>
                </SidebarInset>
            </div>
        </SidebarProvider>
    );
}
