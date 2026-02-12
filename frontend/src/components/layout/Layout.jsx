import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, Outlet, Link } from 'react-router-dom';
import { Menu, X, Sun, Moon, LogOut } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const location = useLocation();

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    const isDark = localStorage.theme === 'dark' || 
      (!('theme' in localStorage) && 
       window.matchMedia('(prefers-color-scheme: dark)').matches);
    setDarkMode(isDark);
    setMounted(true);
  }, []);

  // Apply theme changes
  useEffect(() => {
    if (!mounted) return;
    
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [darkMode, mounted]);

  // Close sidebar when route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  // Only render UI when mounted to avoid hydration issues
  if (!mounted) {
    return <div className="min-h-screen bg-background" />;
  }

  const toggleDarkMode = () => setDarkMode(!darkMode);

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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Mobile header */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-50 bg-background/80 dark:bg-background/90 backdrop-blur-sm border-b border-border transition-colors duration-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden hover:bg-accent/50 transition-colors"
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-sm">
                <span className="text-white font-bold text-lg">CT</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent bg-300% animate-gradient">
                CivicTrack
              </h1>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="rounded-full hover:bg-accent/50 transition-colors"
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5 text-foreground/80" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 pt-16 lg:pt-0">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-72 border-r border-border bg-background/80 dark:bg-background/90 backdrop-blur-sm transition-colors duration-200">
          <div className="flex items-center h-20 px-6 border-b border-border">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <span className="text-white font-bold text-xl">CT</span>
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent bg-300% animate-gradient">
                CivicTrack
              </h1>
            </Link>
          </div>
          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center px-4 py-3 rounded-lg transition-colors',
                  'text-foreground/80 hover:bg-accent/50 hover:text-foreground',
                  location.pathname === item.path && 'bg-accent text-foreground'
                )}
              >
                <span className="mr-3 text-lg">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}
          </nav>
          <div className="p-4 border-t border-border space-y-2">
            {user && (
              <Link
                to="/profile"
                className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-accent/50"
              >
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover border border-border"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                    {(user.name || 'U').slice(0, 1).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-sm font-medium truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
              </Link>
            )}
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={toggleDarkMode}
            >
              {darkMode ? (
                <Sun className="mr-2 h-4 w-4" />
              ) : (
                <Moon className="mr-2 h-4 w-4" />
              )}
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              onClick={logout}
            >
              <LogOut className="mr-2 h-4 w-4" />
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
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                onClick={() => setIsSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: 'tween', ease: 'easeInOut' }}
                className="fixed top-0 left-0 z-50 w-64 h-full bg-background border-r border-border lg:hidden"
              >
                <div className="flex items-center justify-between h-16 px-6 border-b border-border">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                    CivicTrack
                  </h1>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsSidebarOpen(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
                <nav className="p-4 space-y-1">
                  {navItems.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={cn(
                        'flex items-center px-4 py-3 rounded-lg transition-colors',
                        'text-foreground/80 hover:bg-accent/50 hover:text-foreground',
                        location.pathname === item.path && 'bg-accent text-foreground'
                      )}
                    >
                      <span className="mr-3 text-lg">{item.icon}</span>
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  ))}
                </nav>
                <div className="p-4 border-t border-border space-y-2">
                  {user && (
                    <Link
                      to="/profile"
                      onClick={() => setIsSidebarOpen(false)}
                      className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-accent/50"
                    >
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt=""
                          className="w-9 h-9 rounded-full object-cover border border-border"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium text-primary">
                          {(user.name || 'U').slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0 flex-1 text-left">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      </div>
                    </Link>
                  )}
                  <Button
                    variant="outline"
                    className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
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
        <main className="flex-1 overflow-auto">
          <div className="container mx-auto p-4 md:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="min-h-[calc(100vh-8rem)]"
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
