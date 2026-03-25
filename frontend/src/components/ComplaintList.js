import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useNotifications } from '../contexts/NotificationContext';

export default function ComplaintList() {
  const { socket } = useNotifications();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    issueType: '',
  });
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  useEffect(() => {
    fetchComplaints();
  }, [filters]);

  useEffect(() => {
    if (!socket) return;

    const handleCreated = () => {
      fetchComplaints();
    };

    const handleUpdated = () => {
      fetchComplaints();
    };

    socket.on('complaintCreated', handleCreated);
    socket.on('complaintUpdated', handleUpdated);

    return () => {
      socket.off('complaintCreated', handleCreated);
      socket.off('complaintUpdated', handleUpdated);
    };
  }, [socket, filters.status, filters.issueType]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const response = await api.get('/complaints', { params: filters });
      setComplaints(response.data.complaints || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getIssueIcon = (issueType) => {
    switch (issueType) {
      case 'pothole':
        return '🚗';
      case 'garbage':
        return '🗑️';
      case 'streetlight':
        return '💡';
      case 'water_leakage':
        return '💧';
      case 'public_safety':
        return '🚨';
      default:
        return '📝';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">My Complaints</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Filter by Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div>
          <label className="block text-gray-700 font-semibold mb-2">Filter by Issue Type</label>
          <select
            name="issueType"
            value={filters.issueType}
            onChange={handleFilterChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
          >
            <option value="">All Issues</option>
            <option value="pothole">Pothole</option>
            <option value="garbage">Garbage Overflow</option>
            <option value="streetlight">Broken Streetlight</option>
            <option value="water_leakage">Water Leakage</option>
            <option value="public_safety">Public Safety</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <p className="text-gray-600">Loading complaints...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No complaints found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {complaints.map((complaint) => (
            <div
              key={complaint._id}
              className="border border-gray-300 rounded-lg p-4 hover:shadow-lg transition cursor-pointer"
              onClick={() => setSelectedComplaint(complaint)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <span className="text-3xl">{getIssueIcon(complaint.issueType)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg capitalize">
                        {complaint.issueType.replace('_', ' ')}
                      </h3>
                      <span className={`inline-flex items-center text-xs px-3 py-1 rounded-full font-semibold ${getStatusColor(complaint.status)}`}>
                        {complaint.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-600">{complaint.location.address}</p>
                    <p className="text-sm text-gray-500 mt-2">{complaint.description}</p>
                    <p className="text-xs text-gray-400 mt-2">ID: {complaint.complaintId}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-blue-900">{complaint.priority}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(complaint.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedComplaint && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-96 overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-blue-900">Complaint Details</h3>
              <button
                onClick={() => setSelectedComplaint(null)}
                className="text-gray-600 hover:text-gray-900 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Complaint ID</p>
                <p className="font-semibold">{selectedComplaint.complaintId}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Description</p>
                <p>{selectedComplaint.description}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p>{selectedComplaint.location.address}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Status</p>
                <p className="font-semibold capitalize">{selectedComplaint.status.replace('_', ' ')}</p>
              </div>

              {selectedComplaint.resolutionNotes && (
                <div>
                  <p className="text-sm text-gray-600">Resolution Notes</p>
                  <p>{selectedComplaint.resolutionNotes}</p>
                </div>
              )}

              {selectedComplaint.image && (
                <div>
                  <p className="text-sm text-gray-600">Image</p>
                  <img
                    src={selectedComplaint.image}
                    alt="Complaint"
                    className="w-full h-32 object-cover rounded-lg mt-2"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
