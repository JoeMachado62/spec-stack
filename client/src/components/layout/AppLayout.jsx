import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { Layers, LogOut, FolderOpen, Sparkles, PanelLeftClose, PanelLeftOpen } from 'lucide-react';

export default function AppLayout() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen relative">
            {/* Ambient background */}
            <div className="ambient-bg" />

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar — collapsed by default, toggleable */}
            <aside
                className={`
                    fixed top-0 left-0 h-screen flex flex-col z-40
                    border-r border-[var(--color-border-subtle)]
                    bg-[var(--color-bg-secondary)]/95 backdrop-blur-xl
                    transition-all duration-300 ease-in-out
                    ${sidebarOpen ? 'w-[240px] translate-x-0' : 'w-[240px] -translate-x-full lg:w-[60px] lg:translate-x-0'}
                `}
            >
                {/* Logo */}
                <div className="p-4 flex items-center gap-3 min-h-[64px]">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center shrink-0 cursor-pointer" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <Layers className="w-4 h-4 text-white" />
                    </div>
                    <div className={`overflow-hidden transition-all duration-300 ${sidebarOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 lg:hidden'}`}>
                        <h1 className="font-[var(--font-display)] text-base font-bold gradient-text-brand whitespace-nowrap">PRD Wizard</h1>
                        <p className="text-[0.5625rem] text-[var(--color-text-muted)] tracking-widest uppercase whitespace-nowrap">Spec Engineering</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-2 mt-2 space-y-1">
                    <NavLink
                        to="/dashboard"
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                ? 'bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]'
                                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-glass)]'
                            }`
                        }
                        title="My Projects"
                    >
                        <FolderOpen className="w-4 h-4 shrink-0" />
                        <span className={`transition-all duration-300 whitespace-nowrap ${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden lg:hidden'}`}>My Projects</span>
                    </NavLink>

                    <NavLink
                        to="/examples"
                        onClick={() => setSidebarOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                ? 'bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]'
                                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-glass)]'
                            }`
                        }
                        title="Example Library"
                    >
                        <Sparkles className="w-4 h-4 shrink-0" />
                        <span className={`transition-all duration-300 whitespace-nowrap ${sidebarOpen ? 'opacity-100' : 'opacity-0 w-0 overflow-hidden lg:hidden'}`}>Examples</span>
                    </NavLink>
                </nav>

                {/* Bottom: user + collapse toggle */}
                <div className="p-3 border-t border-[var(--color-border-subtle)]">
                    {sidebarOpen && (
                        <div className="flex items-center gap-3 mb-3 animate-fade-in">
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[0.625rem] font-bold text-white shrink-0">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">{user?.name || 'User'}</p>
                                <p className="text-[0.625rem] text-[var(--color-text-muted)] truncate">{user?.email || ''}</p>
                            </div>
                        </div>
                    )}
                    {sidebarOpen && (
                        <button onClick={handleLogout} className="btn-ghost w-full justify-start text-xs mb-2 animate-fade-in">
                            <LogOut className="w-3.5 h-3.5" /> Sign Out
                        </button>
                    )}
                    {/* Collapse/expand toggle — desktop only */}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="hidden lg:flex btn-ghost w-full justify-center text-xs"
                        title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
                    >
                        {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
                    </button>
                </div>
            </aside>

            {/* Mobile hamburger */}
            <button
                onClick={() => setSidebarOpen(true)}
                className="fixed top-4 left-4 z-30 lg:hidden w-10 h-10 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-subtle)] flex items-center justify-center"
            >
                <PanelLeftOpen className="w-4 h-4 text-[var(--color-text-secondary)]" />
            </button>

            {/* Main content — full width minus the thin icon rail on desktop */}
            <main className={`min-h-screen transition-all duration-300 ${sidebarOpen ? 'lg:ml-[240px]' : 'lg:ml-[60px]'}`}>
                <Outlet />
            </main>
        </div>
    );
}
