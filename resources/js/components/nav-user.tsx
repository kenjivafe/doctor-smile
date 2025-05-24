import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { UserInfo } from '@/components/user-info';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ChevronsUpDown, LogOut, Settings } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';

export function NavUser() {
    const { auth } = usePage<SharedData>().props;
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);
    const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
    
    // Update menu position based on button position
    const updateMenuPosition = useCallback(() => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            // Position menu above the button
            setMenuPosition({
                top: rect.top - 8, // Slight offset
                left: rect.left
            });
        }
    }, []);
    
    // Update position when menu opens
    useEffect(() => {
        if (isOpen) {
            updateMenuPosition();
            // Also update on window resize
            window.addEventListener('resize', updateMenuPosition);
            return () => window.removeEventListener('resize', updateMenuPosition);
        }
    }, [isOpen, updateMenuPosition]);
    
    // Close the menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
                buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <SidebarMenu>
            <SidebarMenuItem>
                <div className="relative" ref={buttonRef}>
                    <SidebarMenuButton 
                        size="lg" 
                        className="text-sidebar-accent-foreground group w-full"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <UserInfo user={auth.user} />
                        <ChevronsUpDown className="ml-auto size-4" />
                    </SidebarMenuButton>
                    
                    {isOpen && (
                        <div 
                            ref={menuRef}
                            className="fixed w-56 rounded-lg border border-border bg-popover p-1 shadow-md z-[9999]"
                            style={{
                                bottom: `calc(100vh - ${menuPosition.top}px)`,
                                left: `${menuPosition.left}px`
                            }}
                        >
                            <div className="p-2 font-normal">
                                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                                    <UserInfo user={auth.user} showEmail={true} />
                                </div>
                            </div>
                            <div className="mx-1 my-1 h-px bg-border" />
                            <div className="p-1">
                                <Link
                                    className="flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                                    href={route('profile.edit')} 
                                    as="button"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <Settings className="size-4" />
                                    Settings
                                </Link>
                            </div>
                            <div className="mx-1 my-1 h-px bg-border" />
                            <div className="p-1">
                                <Link
                                    className="flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground"
                                    method="post"
                                    href={route('logout')}
                                    as="button"
                                    onClick={() => setIsOpen(false)}
                                >
                                    <LogOut className="size-4" />
                                    Log out
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </SidebarMenuItem>
        </SidebarMenu>
    );
}
