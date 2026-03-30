import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Users,
  HeartHandshake,
  Package,
  UsersRound,
  UserCog,
  LogOut,
  Heart,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/hooks/use-mobile';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/familias', label: 'Famílias', icon: Users },
  { to: '/atendimentos', label: 'Atendimentos', icon: HeartHandshake },
  { to: '/cestas', label: 'Cestas Básicas', icon: Package },
  { to: '/grupos', label: 'Grupos', icon: UsersRound },
];

const adminItems = [
  { to: '/funcionarios', label: 'Funcionários', icon: UserCog },
];

export const AppSidebar = () => {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobile = useMediaQuery(1024);

  const allItems = isAdmin ? [...navItems, ...adminItems] : navItems;

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg gradient-primary">
          <Heart className="h-5 w-5 text-sidebar-primary-foreground" />
        </div>
        {(!collapsed || isMobile) && (
          <span className="text-sm font-bold text-sidebar-foreground truncate">
            Mais que Social
          </span>
        )}
        {isMobile && (
          <button onClick={() => setMobileOpen(false)} className="ml-auto text-sidebar-foreground">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {allItems.map(item => {
          const isActive = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {(!collapsed || isMobile) && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        {(!collapsed || isMobile) && user && (
          <div className="mb-2 px-2">
            <p className="text-xs font-semibold text-sidebar-foreground truncate">{user.nome}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{user.role}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {(!collapsed || isMobile) && <span>Sair</span>}
        </button>
      </div>

      {/* Desktop Toggle */}
      {!isMobile && (
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-8 flex h-6 w-6 items-center justify-center rounded-full border bg-card text-muted-foreground shadow-sm hover:bg-muted transition-colors"
        >
          {collapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
        </button>
      )}
    </>
  );

  // Mobile hamburger button
  if (isMobile) {
    return (
      <>
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-card border shadow-card text-foreground lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Mobile overlay */}
        {mobileOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-sidebar animate-slide-in">
              {sidebarContent}
            </aside>
          </>
        )}
      </>
    );
  }

  return (
    <aside
      className={cn(
        'sticky left-0 top-0 z-40 flex h-screen flex-col bg-sidebar transition-all duration-300 shrink-0',
        collapsed ? 'w-[68px]' : 'w-64'
      )}
    >
      {sidebarContent}
    </aside>
  );
};
