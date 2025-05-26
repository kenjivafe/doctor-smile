import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { 
    BookOpen, 
    Calendar, 
    Clock, 

    File, 
    LayoutGrid, 
    Stethoscope, 
    Users, 
    LineChart
} from 'lucide-react';
import AppLogo from './app-logo';

// Dashboard is common for all users
const commonNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
];

// Admin-specific navigation items
const adminNavItems: NavItem[] = [
    ...commonNavItems,
    {
        title: 'Users',
        href: '/admin/users',
        icon: Users,
    },
    {
        title: 'Dentists',
        href: '/admin/dentists',
        icon: Stethoscope,
    },
    {
        title: 'Patients',
        href: '/admin/patients',
        icon: File,
    },
    {
        title: 'Appointments',
        href: '/admin/appointments',
        icon: Calendar,
    },
    {
        title: 'Analytics',
        href: '/admin/analytics',
        icon: LineChart,
    }
];

// Dentist-specific navigation items
const dentistNavItems: NavItem[] = [
    ...commonNavItems,
    {
        title: 'Appointments',
        href: '/dentist/appointments',
        icon: Calendar,
    },
    {
        title: 'Schedule',
        href: '/dentist/schedule',
        icon: Clock,
    },
    {
        title: 'Patients',
        href: '/dentist/patients',
        icon: Users,
    },

];

// Patient-specific navigation items
const patientNavItems: NavItem[] = [
    ...commonNavItems,
    {
        title: 'Book Appointment',
        href: '/patient/book-appointment',
        icon: Calendar,
    },
    {
        title: 'My Appointments',
        href: '/patient/appointments',
        icon: Clock,
    },

];

const footerNavItems: NavItem[] = [
    {
        title: 'Help & Support',
        href: '/help',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    // Access page props safely
    const page = usePage();
    // @ts-expect-error - Safely access props which might have different structure
    const user = page.props?.auth?.user;
    const userRole = user?.role || 'patient';

    // Select navigation items based on user role
    const getNavItemsByRole = (): NavItem[] => {
        switch (userRole) {
            case 'admin':
                return adminNavItems;
            case 'dentist':
                return dentistNavItems;
            case 'patient':
            default:
                return patientNavItems;
        }
    };

    const navItems = getNavItemsByRole();

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
