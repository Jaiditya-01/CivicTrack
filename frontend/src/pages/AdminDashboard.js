import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Icons } from '../components/ui/icons';
import api from '../lib/api';

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updateData, setUpdateData] = useState({
    status: 'pending',
    priority: 'medium',
    assignedDepartment: 'roads',
    resolutionNotes: '',
  });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'department_officer')) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoadingData(true);
      const [statsRes, complaintsRes] = await Promise.all([
        api.get('/complaints/stats/overview'),
        api.get('/complaints?limit=100'),
      ]);
      setStats(statsRes.data.stats);
      setComplaints(complaintsRes.data.complaints || []);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleUpdateComplaint = async () => {
    if (!selectedComplaint) return;
    try {
      setUpdating(true);
      await api.put(`/complaints/${selectedComplaint._id}/status`, updateData);
      setSelectedComplaint(null);
      fetchData();
    } catch (error) {
      console.error('Failed to update complaint:', error);
    } finally {
      setUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Icons.loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'department_officer')) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage all complaints and update status
        </p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {[
            { label: 'Total', value: stats.totalComplaints, color: 'bg-primary' },
            { label: 'Pending', value: stats.pending, color: 'bg-yellow-500' },
            { label: 'In Progress', value: stats.inProgress, color: 'bg-blue-500' },
            { label: 'Resolved', value: stats.resolved, color: 'bg-green-500' },
            { label: 'Rejected', value: stats.rejected, color: 'bg-red-500' },
          ].map((item) => (
            <Card key={item.label}>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-bold">{item.value ?? 0}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Complaints Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Complaints</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingData ? (
            <div className="flex justify-center py-12">
              <Icons.loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2">ID</th>
                    <th className="text-left py-3 px-2">Citizen</th>
                    <th className="text-left py-3 px-2">Issue</th>
                    <th className="text-left py-3 px-2">Location</th>
                    <th className="text-left py-3 px-2">Status</th>
                    <th className="text-left py-3 px-2">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((complaint) => (
                    <tr key={complaint._id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-2 font-mono text-xs">{complaint.complaintId || complaint._id?.slice(-6)}</td>
                      <td className="py-3 px-2">{complaint.citizen?.name ?? '—'}</td>
                      <td className="py-3 px-2 capitalize">{complaint.issueType?.replace('_', ' ') ?? '—'}</td>
                      <td className="py-3 px-2 max-w-[180px] truncate">{complaint.location?.address ?? '—'}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          complaint.status === 'resolved' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                          : complaint.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                          : complaint.status === 'rejected' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {complaint.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            asChild
                          >
                            <Link to={`/complaints/${complaint._id}`}>View</Link>
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedComplaint(complaint);
                              setUpdateData({
                                status: complaint.status || 'pending',
                                priority: complaint.priority || 'medium',
                                assignedDepartment: complaint.assignedDepartment || 'roads',
                                resolutionNotes: complaint.resolutionNotes || '',
                              });
                            }}
                          >
                            Update
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {complaints.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">No complaints yet.</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Update Complaint</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setSelectedComplaint(null)}>
                <Icons.x className="h-5 w-5" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select
                  value={updateData.status}
                  onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Priority</label>
                <select
                  value={updateData.priority}
                  onChange={(e) => setUpdateData({ ...updateData, priority: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Assigned Department</label>
                <select
                  value={updateData.assignedDepartment}
                  onChange={(e) => setUpdateData({ ...updateData, assignedDepartment: e.target.value })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="roads">Roads</option>
                  <option value="water">Water</option>
                  <option value="electricity">Electricity</option>
                  <option value="sanitation">Sanitation</option>
                  <option value="public_safety">Public Safety</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Resolution Notes</label>
                <textarea
                  value={updateData.resolutionNotes}
                  onChange={(e) => setUpdateData({ ...updateData, resolutionNotes: e.target.value })}
                  className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Optional notes when resolving..."
                />
              </div>
              <Button
                className="w-full"
                onClick={handleUpdateComplaint}
                disabled={updating}
              >
                {updating ? <Icons.loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Update Complaint
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
