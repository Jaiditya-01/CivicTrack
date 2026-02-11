import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Icons } from '../components/ui/icons';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4 text-center">
      <div className="relative w-full max-w-md mx-auto">
        <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl opacity-75 blur-xl"></div>
        <div className="relative bg-background p-8 rounded-2xl shadow-2xl">
          <div className="flex flex-col items-center">
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/30 rounded-full">
              <Icons.alertTriangle className="h-12 w-12 text-red-600 dark:text-red-400" />
            </div>
            <h1 className="text-6xl font-bold text-foreground mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Page Not Found</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              Oops! The page you're looking for doesn't exist or has been moved. Let's get you back on track.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full">
              <Button asChild className="w-full sm:w-auto">
                <Link to="/">
                  <Icons.home className="mr-2 h-4 w-4" />
                  Go to Home
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full sm:w-auto">
                <a href="mailto:support@civictrack.com">
                  <Icons.mail className="mr-2 h-4 w-4" />
                  Contact Support
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
        {[
          { title: 'Dashboard', icon: <Icons.layoutDashboard className="h-5 w-5" />, path: '/dashboard' },
          { title: 'Complaints', icon: <Icons.clipboardList className="h-5 w-5" />, path: '/complaints' },
          { title: 'Map', icon: <Icons.mapPin className="h-5 w-5" />, path: '/map' },
          { title: 'Profile', icon: <Icons.user className="h-5 w-5" />, path: '/profile' },
        ].map((item) => (
          <Link
            key={item.title}
            to={item.path}
            className="p-4 rounded-lg border hover:bg-muted/50 transition-colors flex flex-col items-center text-center"
          >
            <div className="p-2 mb-2 rounded-full bg-primary/10 text-primary">
              {item.icon}
            </div>
            <span className="text-sm font-medium">{item.title}</span>
          </Link>
        ))}
      </div>
      
      <div className="mt-12 text-sm text-muted-foreground">
        <p>Still can't find what you're looking for? Try our <a href="/help" className="text-primary hover:underline">help center</a>.</p>
      </div>
    </div>
  );
}
