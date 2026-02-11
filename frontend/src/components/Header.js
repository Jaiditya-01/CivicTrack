import { useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-md bg-primary-900 flex items-center justify-center text-white font-bold">CT</div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">CivicTrack</h1>
              <p className="text-xs text-gray-500">Smart City Complaint Management</p>
            </div>
          </Link>
        </div>

        <nav className="flex items-center gap-6">
          <Link to="/dashboard" className="text-sm text-gray-700 hover:text-gray-900">Dashboard</Link>
          <Link to="/" className="text-sm text-gray-700 hover:text-gray-900">Map</Link>

          {user ? (
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm text-primary-900 font-medium">Login</Link>
              <Link to="/register" className="text-sm text-gray-700">Register</Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
} 
