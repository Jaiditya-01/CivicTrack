import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Outlet, Link } from 'react-router-dom';
import { Menu, X, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMounted(true);
    // Enforce dark mode
    document.documentElement.classList.add('dark');
  }, []);

  // Close sidebar when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  // Only render UI when mounted to avoid hydration issues
  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  const isAdmin = user?.role === 'admin' || user?.role === 'department_officer';
  const navItems = [
    { name: isAdmin ? 'Admin' : 'Dashboard', path: isAdmin ? '/admin' : '/dashboard', icon: isAdmin ? '🛡️' : '📊' },
    ...(isAdmin ? [{ name: 'Dashboard', path: '/dashboard', icon: '📊' }] : []),
    { name: 'Complaints', path: '/complaints', icon: '📝' },
    { name: 'Map View', path: '/map', icon: '🗺️' },
    { name: 'Help', path: '/help', icon: '❓' },
    { name: 'Profile', path: '/profile', icon: '👤' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row overflow-hidden relative">
      {/* Global Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s', animationDuration: '8s' }} />
        <div className="absolute top-[40%] left-[20%] w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[80px] animate-pulse-glow" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-50 glass border-b-0 m-2 rounded-xl">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden hover:bg-white/10 transition-colors"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="text-white font-bold text-lg">CT</span>
              </div>
              <h1 className="text-2xl font-bold gradient-text-primary animate-gradient bg-300%">
                CivicTrack
              </h1>
            </Link>
          </div>
        </div>
      </header>

      {/* Desktop sidebar - Floating Glass Panel */}
      <aside className="hidden lg:flex flex-col w-72 m-4 rounded-2xl glass border-0 transition-all duration-300 relative z-20 h-[calc(100vh-2rem)]">
        <div className="flex items-center h-24 px-6">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/30 group-hover:scale-105 transition-transform duration-300">
              <span className="text-white font-bold text-xl">CT</span>
            </div>
            <h1 className="text-2xl font-bold gradient-text-primary animate-gradient bg-300%">
              CivicTrack
            </h1>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto no-scrollbar">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                'flex items-center px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden',
                'text-muted-foreground hover:text-white',
                location.pathname === item.path
                  ? 'bg-primary/20 text-white shadow-[0_0_20px_-10px_hsl(var(--primary)/0.5)]'
                  : 'hover:bg-white/5'
              )}
            >
              {location.pathname === item.path && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-primary/20 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <span className={cn(
                "mr-3 text-xl transition-transform duration-200 group-hover:scale-110",
                location.pathname === item.path ? "scale-110" : ""
              )}>
                {item.icon}
              </span>
              <span className="font-medium relative z-10">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 mt-auto space-y-4">
          {user && (
            <Link
              to="/profile"
              className="flex items-center gap-3 w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 hover:border-white/10"
            >
              {user.profileImage ? (
                <img
                  src={user.profileImage}
                  alt=""
                  className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-sm font-bold text-primary">
                  {(user.name || 'U').slice(0, 1).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm font-semibold truncate text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
            </Link>
          )}

          <Button
            variant="outline"
            size="lg"
            className="w-full justify-center text-red-400 border-red-500/10 bg-red-500/5 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/20 transition-all duration-300"
            onClick={logout}
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-2 left-2 bottom-2 z-50 w-72 rounded-2xl glass border-0 lg:hidden overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between h-20 px-6">
                <h1 className="text-xl font-bold gradient-text-primary">
                  CivicTrack
                </h1>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hover:bg-white/10"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      'flex items-center px-4 py-3 rounded-xl transition-colors',
                      'text-muted-foreground hover:bg-white/5 hover:text-foreground',
                      location.pathname === item.path && 'bg-primary/20 text-white'
                    )}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
              </nav>
              <div className="p-4 mt-auto border-t border-white/5">
                <Button
                  variant="outline"
                  className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 border-white/5"
                  onClick={() => { logout(); setIsSidebarOpen(false); }}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="flex-1 overflow-auto relative h-screen">
        <div className="container mx-auto p-4 md:p-8 pt-24 lg:pt-8 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="min-h-[calc(100vh-6rem)]"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
