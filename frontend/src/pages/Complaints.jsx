import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Icons } from '../components/ui/icons';
import api from '../lib/api';

export default function Complaints() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: complaints, isLoading } = useQuery(
    ['complaints'],
    async () => {
      const response = await api.get('/complaints');
      return response.data.complaints || [];
    },
    {
      placeholderData: [],
    }
  );

  const filteredComplaints = complaints?.filter((complaint) => {
    const title = complaint.issueType?.replace('_', ' ') || '';
    const desc = complaint.description || '';
    const q = searchQuery.toLowerCase();
    return title.toLowerCase().includes(q) || desc.toLowerCase().includes(q);
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Complaints</h1>
          <p className="text-muted-foreground">
            View and manage all reported issues
          </p>
        </div>
        <Button asChild>
          <Link to="/complaints/new">
            <Icons.plus className="mr-2 h-4 w-4" />
            New Complaint
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle>All Complaints</CardTitle>
            <div className="relative w-full md:w-64">
              <Icons.search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search complaints..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Icons.spinner className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredComplaints.length > 0 ? (
            <div className="space-y-4">
              {filteredComplaints.map((complaint) => (
                <motion.div
                  key={complaint._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="hover:shadow-md transition-shadow">
                    <Link to={`/complaints/${complaint._id}`}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium capitalize">
                              {complaint.issueType?.replace('_', ' ') || 'Complaint'}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {complaint.description}
                            </p>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs shrink-0 ${
                            complaint.status === 'resolved'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                              : complaint.status === 'in_progress'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                          }`}>
                            {complaint.status?.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="mt-2 flex items-center text-sm text-muted-foreground">
                          <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
                          <span className="mx-2">•</span>
                          <span className="capitalize">{complaint.issueType?.replace('_', ' ') || '—'}</span>
                          {complaint.complaintId && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="font-mono text-xs">{complaint.complaintId}</span>
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Icons.alertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No complaints found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {searchQuery ? 'Try a different search term' : 'Get started by creating a new complaint'}
              </p>
              <Button asChild>
                <Link to="/complaints/new">
                  <Icons.plus className="mr-2 h-4 w-4" />
                  New Complaint
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
