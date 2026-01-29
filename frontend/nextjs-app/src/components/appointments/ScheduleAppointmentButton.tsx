'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { GradientButton } from '@/components/ui/gradient-button';
import { appointmentsApi } from '@/lib/api/appointments.api';
import { useAuthStore } from '@/lib/store/auth.store';
import { toast } from 'sonner';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface ScheduleAppointmentButtonProps {
  psychologistId: string;
  psychologistName: string;
}

export function ScheduleAppointmentButton({
  psychologistId,
  psychologistName
}: ScheduleAppointmentButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const user = useAuthStore(state => state.user);

  const handleSchedule = async () => {
    if (!user?.profileId) {
      toast.error('User profile not found');
      return;
    }

    setLoading(true);

    try {
      console.log('📅 Scheduling appointment:', {
        psychologistId,
        patientId: user.profileId,
        scheduledAt: selectedDate.toISOString(),
        notes
      });

      const response = await appointmentsApi.create({
        psychologistId,           // Use psychologist's profileId
        patientId: user.profileId, // Use patient's profileId
        scheduledAt: selectedDate.toISOString(),
        notes: notes || undefined
      });

      console.log('✅ Appointment created:', response.data);

      toast.success(`Appointment scheduled with ${psychologistName}!`);
      setOpen(false);
      setNotes('');
      setSelectedDate(new Date());

    } catch (error: any) {
      console.error('❌ Failed to schedule appointment:', error);
      toast.error(error.response?.data?.message || 'Failed to schedule appointment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <GradientButton
        onClick={() => {
          console.log('📅 Schedule button clicked');
          setOpen(true);
        }}
        className="w-full"
      >
        Schedule Appointment
      </GradientButton>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="backdrop-blur-xl bg-black/90 border border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>Schedule Appointment with {psychologistName}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Select Date & Time
              </label>
              <DatePicker
                selected={selectedDate}
                onChange={(date: Date | null) => date && setSelectedDate(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={30}
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={new Date()}
                className="w-full px-4 py-2 rounded-lg backdrop-blur-xl bg-white/10 border border-white/20 text-white"
                calendarClassName="bg-gray-900"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Google Meet link, topics to discuss..."
                className="w-full px-4 py-2 rounded-lg backdrop-blur-xl bg-white/10 border border-white/20 text-white min-h-[100px]"
                rows={4}
              />
            </div>

            <GradientButton
              onClick={handleSchedule}
              disabled={loading}
              className="w-full"
            >
              {loading ? "Scheduling..." : "Confirm Appointment"}
            </GradientButton>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
