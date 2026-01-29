'use client';

import { useEffect, useState } from 'react';
import { sessionRequestsApi, SessionRequest } from '@/lib/api/session-requests.api';
import { RequestCard } from './RequestCard';
import { Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/shared/GlassCard';

export function PendingRequests() {
  const [requests, setRequests] = useState<SessionRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      // setLoading(true); // Don't show full loading state on refresh to avoid flicker
      const response = await sessionRequestsApi.getPending();
      setRequests(response.data);
    } catch (error) {
      console.error('Failed to fetch pending requests:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchRequests();

    // Optional: Poll for new requests every 30 seconds
    const interval = setInterval(fetchRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && requests.length === 0) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-purple-500" /></div>;
  }

  if (requests.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-muted-foreground">No pending requests at the moment.</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold mb-4">Pending Requests</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.map(req => (
            <RequestCard key={req.id} request={req} onUpdate={fetchRequests} />
        ))}
      </div>
    </div>
  );
}
