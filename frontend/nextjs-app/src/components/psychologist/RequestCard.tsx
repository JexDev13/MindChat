'use client';

import { SessionRequest } from '@/lib/api/session-requests.api';
import { GlassCard } from '@/components/shared/GlassCard';
import { GradientButton } from '@/components/ui/gradient-button';
import { useState } from 'react';
import { sessionRequestsApi } from '@/lib/api/session-requests.api';
import { useAuthStore } from '@/lib/store/auth.store';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface RequestCardProps {
  request: SessionRequest;
  onUpdate: () => void;
}

export function RequestCard({ request, onUpdate }: RequestCardProps) {
  const [loading, setLoading] = useState(false);
  const user = useAuthStore(state => state.user);
  const router = useRouter();

  const handleAccept = async () => {
    if (!user?.profileId) return;

    setLoading(true);
    try {
      // Step 1: Assign self
      await sessionRequestsApi.assignPsychologist(request.id, {
        psychologistId: user.profileId
      });

      // Step 2: Update status to Accepted
      await sessionRequestsApi.updateStatus(request.id, {
        status: 'Accepted'
      });

      toast.success('Session accepted!');
      onUpdate();

    } catch (error: any) {
      console.error('Failed to accept request:', error);
      toast.error('Failed to accept request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard className="p-4">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-bold">New Session Request</h4>
          <p className="text-xs text-muted-foreground">
            {new Date(request.createdAt).toLocaleString()}
          </p>
        </div>
        <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded text-xs">
          {request.status}
        </span>
      </div>

      <div className="bg-white/5 p-3 rounded-lg mb-4 text-sm">
        <p className="text-zinc-300">"{request.initialMessage}"</p>
      </div>

      <GradientButton
        onClick={handleAccept}
        disabled={loading}
        className="w-full"
      >
        {loading ? "Accepting..." : "Accept Request"}
      </GradientButton>
    </GlassCard>
  );
}
