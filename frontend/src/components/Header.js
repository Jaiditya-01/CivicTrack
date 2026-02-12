import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from './ui/button';

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="glass sticky top-0 z-50 rounded-b-xl mx-4 mt-2">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold shadow-lg shadow-primary/20 group-hover:scale-105 transition-transform">CT</div>
            <div>
              <h1 className="text-xl font-bold gradient-text-primary">CivicTrack</h1>
              <p className="text-xs text-muted-foreground">Smart City Complaint Management</p>
            </div>
          </Link>
        </div>

        <nav className="flex items-center gap-6">
          <Link to="/dashboard" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Dashboard</Link>
          <Link to="/map" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Map</Link>

          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-medium text-foreground">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role?.replace('_', ' ')}</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="destructive"
                size="sm"
              >
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
