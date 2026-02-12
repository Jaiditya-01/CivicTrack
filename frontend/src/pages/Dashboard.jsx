import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { 
  AlertCircle,
  CheckCircle,
  Clock,
  Plus,
  RefreshCw,
  MapPin,
  HelpCircle,
  Settings,
  LogOut,
  Map,
  PlusCircle,
  List
} from 'lucide-react';
import api from '../lib/api';

// Sample data for the dashboard
const stats = [];

const recentActivity = [];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Fetch dashboard stats if user is admin
  const { data: statsData, isLoading: isStatsLoading } = useQuery(
    ['stats'],
    async () => {
      if (user?.role === 'admin' || user?.role === 'department_officer') {
        const response = await api.get('/complaints/stats/overview');
        return response.data.stats;
      }
      return null;
    },
    {
      enabled: !!user && (user.role === 'admin' || user.role === 'department_officer'),
      staleTime: 5 * 60 * 1000,
      onError: (error) => {
        console.error('Error fetching stats:', error);
      },
    }
  );

  // Fetch recent complaints
  const { data: recentComplaints, isLoading: isRecentLoading } = useQuery(
    ['recentComplaints'],
    async () => {
      const response = await api.get('/complaints?limit=5&page=1');
      return response.data.complaints || [];
    },
    {
      staleTime: 2 * 60 * 1000,
      enabled: !!user?.role,
    }
  );

  // Status summary for Overview (works for both citizen and admin)
  const { data: statusSummary } = useQuery(
    ['complaintsStatsSummary'],
    async () => {
      const response = await api.get('/complaints/stats/summary');
      return response.data.summary;
    },
    { staleTime: 2 * 60 * 1000, enabled: !!user?.role }
  );

  const totalForOverview = statusSummary?.total ?? 0;
  const statusOverviewItems = [
    { name: 'Resolved', value: totalForOverview ? Math.round(((statusSummary?.resolved ?? 0) / totalForOverview) * 100) : 0, color: 'bg-green-500' },
    { name: 'In Progress', value: totalForOverview ? Math.round(((statusSummary?.inProgress ?? 0) / totalForOverview) * 100) : 0, color: 'bg-blue-500' },
    { name: 'Pending', value: totalForOverview ? Math.round(((statusSummary?.pending ?? 0) / totalForOverview) * 100) : 0, color: 'bg-yellow-500' },
    { name: 'Rejected', value: totalForOverview ? Math.round(((statusSummary?.rejected ?? 0) / totalForOverview) * 100) : 0, color: 'bg-red-500' },
  ].filter((item) => item.value > 0);

  // Don't block whole page on stats; show layout and load sections independently
  const showStatsSpinner = (user?.role === 'admin' || user?.role === 'department_officer') && isStatsLoading;

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row md:items-start md:justify-between gap-4"
        >
          <div className="max-w-3xl flex items-center gap-4">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt=""
                className="w-14 h-14 rounded-full border-2 border-white/30 object-cover shrink-0"
              />
            ) : null}
            <div>
              <h1 className="text-3xl font-bold mb-2 text-white">Welcome back, {user?.name || 'User'}!</h1>
              <p className="text-blue-100">
                Here's what's happening with your complaints and reports today.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
              <Button variant="secondary" className="bg-white/10 hover:bg-white/20" asChild>
                <Link to="/complaints/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New Complaint
                </Link>
              </Button>
              <Button
                variant="outline"
                className="bg-transparent border-white/20 text-white hover:bg-white/10"
                asChild
              >
                <Link to="/complaints">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  View All
                </Link>
              </Button>
              </div>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0 bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </motion.div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {showStatsSpinner ? (
          [...Array(4)].map((_, i) => (
            <Card key={i} className="h-full">
              <CardHeader className="pb-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-12 bg-muted animate-pulse rounded" />
              </CardContent>
            </Card>
          ))
        ) : statsData ? [
          { name: 'Total Complaints', value: statsData.totalComplaints || 0, icon: AlertCircle },
          { name: 'Pending', value: statsData.pending || 0, icon: Clock },
          { name: 'In Progress', value: statsData.inProgress || 0, icon: Clock },
          { name: 'Resolved', value: statsData.resolved || 0, icon: CheckCircle },
        ].map((stat, index) => (
          <motion.div
            key={stat.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="h-full hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.name}
                </CardTitle>
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        )) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-4"
        >
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isRecentLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
                  </div>
                ) : recentComplaints && recentComplaints.length > 0 ? (
                  recentComplaints.map((complaint) => (
                    <div key={complaint._id} className="flex items-start pb-4 border-b border-gray-200 dark:border-gray-700 last:border-0 last:pb-0">
                      <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg mr-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <Link to={`/complaints/${complaint._id}`} className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium capitalize">{complaint.issueType?.replace('_', ' ') || 'Complaint'}</h3>
                          <span className="text-xs text-muted-foreground">
                            {new Date(complaint.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {complaint.description}
                        </p>
                        <div className="mt-1">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            complaint.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                            : complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {complaint.status?.replace('_', ' ')}
                          </span>
                        </div>
                      </Link>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">No complaints yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="lg:col-span-3 space-y-4"
        >
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3">
              <Button
                variant="outline"
                className="justify-start group hover:bg-primary/10 hover:text-primary transition-all duration-300 transform hover:-translate-y-0.5"
                onClick={() => navigate('/map')}
              >
                <Map className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="group-hover:font-medium">View Map</span>
              </Button>
              <Button
                variant="outline"
                className="justify-start group hover:bg-primary/10 hover:text-primary transition-all duration-300 transform hover:-translate-y-0.5"
                onClick={() => navigate('/complaints/new')}
              >
                <PlusCircle className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="group-hover:font-medium">New Complaint</span>
              </Button>
              <Button
                variant="outline"
                className="justify-start group hover:bg-primary/10 hover:text-primary transition-all duration-300 transform hover:-translate-y-0.5"
                onClick={() => navigate('/complaints')}
              >
                <List className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="group-hover:font-medium">My Complaints</span>
              </Button>
              <Button
                variant="outline"
                className="justify-start group hover:bg-primary/10 hover:text-primary transition-all duration-300 transform hover:-translate-y-0.5"
                onClick={() => navigate('/map', { state: { openNewComplaint: true } })}
              >
                <MapPin className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                <span className="group-hover:font-medium">Report Location Issue</span>
              </Button>
              <Button 
                variant="outline" 
                className="justify-start group hover:bg-primary/10 hover:text-primary transition-all duration-300 transform hover:-translate-y-0.5"
                asChild
              >
                <Link to="/help" className="flex items-center">
                  <HelpCircle className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="group-hover:font-medium">Get Help</span>
                </Link>
              </Button>
              <Button 
                variant="outline" 
                className="justify-start group hover:bg-primary/10 hover:text-primary transition-all duration-300 transform hover:-translate-y-0.5"
                asChild
              >
                <Link to="/profile" className="flex items-center">
                  <Settings className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
                  <span className="group-hover:font-medium">Settings</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Status Overview - dynamic from database */}
          <Card>
            <CardHeader>
              <CardTitle>Status Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusOverviewItems.length > 0 ? (
                  statusOverviewItems.map((item) => (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.name}</span>
                        <span className="font-medium">{item.value}%</span>
                      </div>
                      <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${item.color} rounded-full transition-all`}
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground py-2">
                    {statusSummary ? 'No complaints yet' : 'Loading…'}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
