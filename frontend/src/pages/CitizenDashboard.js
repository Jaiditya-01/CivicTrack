import { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../AuthContext';
import { Navigate } from 'react-router-dom';
import Header from '../components/Header';
import ComplaintForm from '../components/ComplaintForm';
import ComplaintList from '../components/ComplaintList';

export default function CitizenDashboard() {
  const { user, loading } = useContext(AuthContext);
  const [refreshKey, setRefreshKey] = useState(0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user || user.role !== 'citizen') {
    return <Navigate to="/login" />;
  }

  const handleComplaintSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <ComplaintForm onSuccess={handleComplaintSuccess} />
        <ComplaintList key={refreshKey} />
      </div>
    </div>
  );
}
