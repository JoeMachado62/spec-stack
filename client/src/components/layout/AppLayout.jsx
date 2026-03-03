import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store';
import { Layers, LogOut, User, FolderOpen, Sparkles } from 'lucide-react';

export default function AppLayout() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="min-h-screen flex">
            {/* Ambient background */}
            <div className="ambient-bg" />

            {/* Sidebar */}
            <aside className="w-[260px] fixed top-0 left-0 h-screen flex flex-col border-r border-[var(--color-border-subtle)] bg-[var(--color-bg-secondary)]/80 backdrop-blur-xl z-40">
                {/* Logo */}
                <div className="p-6 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                        <Layers className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="font-[var(--font-display)] text-lg font-bold gradient-text-brand">Spec Stack</h1>
                        <p className="text-[0.625rem] text-[var(--color-text-muted)] tracking-widest uppercase">Spec Engineering</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-3 mt-4 space-y-1">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                ? 'bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] border-l-2 border-[var(--color-brand-primary)]'
                                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-glass)]'
                            }`
                        }
                    >
                        <FolderOpen className="w-4 h-4" />
                        My Projects
                    </NavLink>

                    <NavLink
                        to="/examples"
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive
                                ? 'bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] border-l-2 border-[var(--color-brand-primary)]'
                                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-glass)]'
                            }`
                        }
                    >
                        <Sparkles className="w-4 h-4" />
                        Example Library
                    </NavLink>
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-[var(--color-border-subtle)]">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xs font-bold text-white">
                            {user?.name?.charAt(0) || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{user?.name || 'User'}</p>
                            <p className="text-xs text-[var(--color-text-muted)] truncate">{user?.email || ''}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="btn-ghost w-full justify-start text-xs">
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="ml-[260px] flex-1 min-h-screen">
                <Outlet />
            </main>
        </div>
    );
}
