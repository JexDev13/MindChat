'use client';

import { useEffect, useState } from 'react';
import { appointmentsApi, Appointment } from '@/lib/api/appointments.api';
import { useAuthStore } from '@/lib/store/auth.store';
import { GlassCard } from '@/components/shared/GlassCard';
import { Calendar, Clock, Loader2 } from 'lucide-react';

export function AppointmentsList() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore(state => state.user);

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.profileId) return;

      try {
        setLoading(true);
        let response;

        if (user.role === 'Patient') {
          response = await appointmentsApi.getByPatient(user.profileId);
        } else if (user.role === 'Psychologist') {
          response = await appointmentsApi.getByPsychologist(user.profileId);
        }

        if (response) {
            setAppointments(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [user]);

  if (loading) {
    return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-purple-500" /></div>;
  }

  if (appointments.length === 0) {
    return (
      <GlassCard className="p-8 text-center">
        <p className="text-muted-foreground">No appointments scheduled.</p>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-4">
        <h2 className="text-xl font-bold mb-4">My Appointments</h2>
      {appointments.map((apt) => (
        <GlassCard key={apt.id} className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="bg-purple-500/20 p-3 rounded-lg text-purple-400">
              <Calendar size={24} />
            </div>
            <div>
              <p className="font-bold text-lg">
                {new Date(apt.scheduledAt).toLocaleDateString()}
              </p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock size={14} />
                <span>
                    {new Date(apt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {apt.notes && (
                <p className="mt-2 text-sm bg-white/5 p-2 rounded text-zinc-300">
                    {apt.notes}
                </p>
              )}
            </div>
          </div>
          <div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                apt.isCancelled
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-green-500/20 text-green-400'
            }`}>
                {apt.isCancelled ? 'Cancelled' : 'Scheduled'}
            </span>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
