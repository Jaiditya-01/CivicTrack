import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Icons } from '../components/ui/icons';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { toast } from 'react-hot-toast';

export default function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const isAdmin = user?.role === 'admin' || user?.role === 'department_officer';

  const { data: complaint, isLoading, error } = useQuery(
    ['complaint', id],
    async () => {
      const response = await api.get(`/complaints/${id}`);
      return response.data.complaint;
    }
  );

  const [statusForm, setStatusForm] = useState({
    status: 'pending',
    priority: 'medium',
    assignedDepartment: 'roads',
    resolutionNotes: '',
  });
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    if (complaint) {
      setStatusForm({
        status: complaint.status || 'pending',
        priority: complaint.priority || 'medium',
        assignedDepartment: complaint.assignedDepartment || 'roads',
        resolutionNotes: complaint.resolutionNotes || '',
      });
    }
  }, [complaint]);

  const handleUpdateStatus = async () => {
    try {
      setStatusUpdating(true);
      await api.put(`/complaints/${id}/status`, statusForm);
      toast.success('Status updated');
      queryClient.invalidateQueries(['complaint', id]);
      queryClient.invalidateQueries(['complaints']);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <Icons.alertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">Error loading complaint</h3>
        <p className="text-muted-foreground mb-4">
          {error.response?.data?.message || 'Failed to load complaint details'}
        </p>
        <Button onClick={() => navigate('/complaints')} variant="outline">
          Back to Complaints
        </Button>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center p-4">
        <Icons.alertCircle className="h-12 w-12 text-yellow-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">Complaint not found</h3>
        <p className="text-muted-foreground mb-4">
          The requested complaint could not be found or has been removed.
        </p>
        <Button onClick={() => navigate('/complaints')} variant="outline">
          Back to Complaints
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <Icons.chevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Complaint Details</h1>
          <p className="text-muted-foreground">
            View and manage this complaint
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="capitalize">
                    {complaint.issueType?.replace('_', ' ') || 'Complaint'}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Created on {new Date(complaint.createdAt).toLocaleDateString()}
                    {complaint.complaintId && (
                      <span className="ml-2 font-mono text-xs">({complaint.complaintId})</span>
                    )}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  complaint.status === 'resolved'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                    : complaint.status === 'in_progress'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {complaint.status?.replace('_', ' ')}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-muted-foreground whitespace-pre-line">
                  {complaint.description}
                </p>
              </div>

              {complaint.location && (complaint.location.address || complaint.location.latitude != null) && (
                <div>
                  <h3 className="font-medium mb-2">Location</h3>
                  <p className="text-muted-foreground">
                    {complaint.location.address || '—'}
                  </p>
                  {typeof complaint.location.latitude === 'number' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {complaint.location.latitude.toFixed(4)}, {complaint.location.longitude?.toFixed(4)}
                    </p>
                  )}
                </div>
              )}

              {complaint.image && (
                <div>
                  <h3 className="font-medium mb-2">Image</h3>
                  <img
                    src={complaint.image}
                    alt="Complaint"
                    className="rounded-md max-h-64 object-cover"
                  />
                </div>
              )}

              {complaint.attachments?.length > 0 && (
                <div>
                  <h3 className="font-medium mb-2">Attachments</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {complaint.attachments.map((attachment, index) => (
                      <div key={index} className="border rounded-md overflow-hidden">
                        <img
                          src={attachment.url}
                          alt={`Attachment ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Updates</CardTitle>
            </CardHeader>
            <CardContent>
              {complaint.updates?.length > 0 ? (
                <div className="space-y-6">
                  {complaint.updates.map((update, index) => (
                    <div key={index} className="relative pl-6 pb-6 border-l-2 border-muted last:border-0 last:pb-0">
                      <div className="absolute w-3 h-3 rounded-full bg-primary -left-1.5 top-0.5"></div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">
                          {update.status.charAt(0).toUpperCase() + update.status.slice(1).replace('_', ' ')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(update.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {update.comments || 'No comments provided.'}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No updates available.</p>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Category</p>
                <p className="font-medium capitalize">{complaint.issueType?.replace('_', ' ') || '—'}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Priority</p>
                <p className="font-medium">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    complaint.priority === 'high'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                      : complaint.priority === 'medium'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                  }`}>
                    {complaint.priority}
                  </span>
                </p>
              </div>
              {(complaint.assignedOfficer?.name || complaint.assignedDepartment) && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Assigned</p>
                  <p className="font-medium">
                    {complaint.assignedOfficer?.name || complaint.assignedDepartment || '—'}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
                <p className="font-medium">
                  {new Date(complaint.updatedAt).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>

          {isAdmin ? (
            <Card>
              <CardHeader>
                <CardTitle>Update Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Status</label>
                  <select
                    value={statusForm.status}
                    onChange={(e) => setStatusForm((s) => ({ ...s, status: e.target.value }))}
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
                    value={statusForm.priority}
                    onChange={(e) => setStatusForm((s) => ({ ...s, priority: e.target.value }))}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <select
                    value={statusForm.assignedDepartment}
                    onChange={(e) => setStatusForm((s) => ({ ...s, assignedDepartment: e.target.value }))}
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
                    value={statusForm.resolutionNotes}
                    onChange={(e) => setStatusForm((s) => ({ ...s, resolutionNotes: e.target.value }))}
                    className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    placeholder="Optional..."
                  />
                </div>
                <Button className="w-full" onClick={handleUpdateStatus} disabled={statusUpdating}>
                  {statusUpdating ? <Icons.loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Update Status
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="flex flex-col gap-2">
              <Button variant="outline" className="w-full" onClick={() => navigate('/complaints')}>
                <Icons.chevronLeft className="mr-2 h-4 w-4" />
                Back to Complaints
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
