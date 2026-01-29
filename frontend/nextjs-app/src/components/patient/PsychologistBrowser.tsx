'use client';

import { useEffect, useState } from 'react';
import { psychologistsApi, PsychologistProfile } from '@/lib/api/psychologists.api';
import { PsychologistCard } from './PsychologistCard';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function PsychologistBrowser() {
  const [psychologists, setPsychologists] = useState<PsychologistProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPsychologists = async () => {
      try {
        const response = await psychologistsApi.getAll();
        setPsychologists(response.data);
      } catch (error) {
        console.error('Failed to fetch psychologists:', error);
        toast.error('Failed to load psychologists');
      } finally {
        setLoading(false);
      }
    };

    fetchPsychologists();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-purple-500" /></div>;
  }

  if (psychologists.length === 0) {
    return <p className="text-center text-muted-foreground">No psychologists found.</p>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {psychologists.map(psych => (
        <PsychologistCard key={psych.profileId} psychologist={psych} />
      ))}
    </div>
  );
}
