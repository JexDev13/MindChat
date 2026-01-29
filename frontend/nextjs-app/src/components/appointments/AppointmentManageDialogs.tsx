"use client";

import { useState } from "react";
import { format, addDays, startOfDay } from "date-fns";
import { Loader2, Calendar, Clock, ChevronLeft, AlertTriangle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GradientButton } from "@/components/ui/gradient-button";
import { appointmentsService, Appointment } from "@/lib/api/appointments.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface RescheduleAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment;
  onSuccess?: () => void;
}

export function RescheduleAppointmentDialog({
  open,
  onOpenChange,
  appointment,
  onSuccess
}: RescheduleAppointmentDialogProps) {
  const currentDate = new Date(appointment.scheduledAt);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'date' | 'time' | 'confirm'>('date');

  // Generate next 14 days for date selection
  const today = startOfDay(new Date());
  const availableDates = Array.from({ length: 14 }, (_, i) => addDays(today, i + 1));

  // Time slots with labels
  const timeSlots = [
    { time: "09:00", label: "9:00 AM" },
    { time: "09:30", label: "9:30 AM" },
    { time: "10:00", label: "10:00 AM" },
    { time: "10:30", label: "10:30 AM" },
    { time: "11:00", label: "11:00 AM" },
    { time: "11:30", label: "11:30 AM" },
    { time: "14:00", label: "2:00 PM" },
    { time: "14:30", label: "2:30 PM" },
    { time: "15:00", label: "3:00 PM" },
    { time: "15:30", label: "3:30 PM" },
    { time: "16:00", label: "4:00 PM" },
    { time: "16:30", label: "4:30 PM" },
    { time: "17:00", label: "5:00 PM" },
    { time: "17:30", label: "5:30 PM" },
  ];

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) {
      toast.error("Please select a new date and time");
      return;
    }

    setLoading(true);
    try {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const newScheduledAt = new Date(selectedDate);
      newScheduledAt.setHours(hours, minutes, 0, 0);

      await appointmentsService.update(appointment.id, {
        scheduledAt: newScheduledAt.toISOString()
      });

      toast.success("Appointment rescheduled!", {
        description: `New time: ${format(newScheduledAt, "MMMM d, yyyy 'at' h:mm a")}`
      });

      onOpenChange(false);
      onSuccess?.();
      resetForm();
    } catch (error) {
      console.error("Failed to reschedule appointment:", error);
      toast.error("Failed to reschedule appointment", {
        description: "Please try again later"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setStep('date');
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg bg-black/95 border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="text-blue-500" />
            Reschedule Appointment
          </DialogTitle>
          <DialogDescription>
            Current: {format(currentDate, "MMMM d, yyyy 'at' h:mm a")}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
              step === 'date' ? "bg-blue-500 text-white" : selectedDate ? "bg-green-500 text-white" : "bg-white/10 text-muted-foreground"
            )}>1</div>
            <div className="w-8 h-0.5 bg-white/10" />
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
              step === 'time' ? "bg-blue-500 text-white" : selectedTime ? "bg-green-500 text-white" : "bg-white/10 text-muted-foreground"
            )}>2</div>
            <div className="w-8 h-0.5 bg-white/10" />
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
              step === 'confirm' ? "bg-blue-500 text-white" : "bg-white/10 text-muted-foreground"
            )}>3</div>
          </div>

          {/* Step 1: Date Selection */}
          {step === 'date' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2 mb-4">
                <Calendar size={16} className="text-blue-400" />
                Select New Date
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {availableDates.map((date) => (
                  <button
                    key={date.toISOString()}
                    onClick={() => {
                      setSelectedDate(date);
                      setStep('time');
                    }}
                    className={cn(
                      "p-3 rounded-lg text-center transition-all border",
                      selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                        ? "bg-blue-500 border-blue-400 text-white"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    <div className="text-xs text-muted-foreground">{format(date, 'EEE')}</div>
                    <div className="text-lg font-bold">{format(date, 'd')}</div>
                    <div className="text-xs text-muted-foreground">{format(date, 'MMM')}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Time Selection */}
          {step === 'time' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={() => setStep('date')}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-white"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <h3 className="text-sm font-medium flex items-center gap-2">
                  <Clock size={16} className="text-blue-400" />
                  Select New Time for {selectedDate && format(selectedDate, 'MMM d')}
                </h3>
                <div className="w-16" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {timeSlots.map((slot) => (
                  <button
                    key={slot.time}
                    onClick={() => setSelectedTime(slot.time)}
                    className={cn(
                      "px-3 py-3 rounded-lg text-sm transition-all border",
                      selectedTime === slot.time
                        ? "bg-blue-500 border-blue-400 text-white"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                    )}
                  >
                    {slot.label}
                  </button>
                ))}
              </div>
              <div className="pt-2">
                <label className="text-xs text-muted-foreground block mb-2">Or choose a custom time</label>
                <input
                  type="time"
                  value={selectedTime || ""}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 'confirm' && selectedDate && selectedTime && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={() => setStep('time')}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-white"
                >
                  <ChevronLeft size={16} /> Back
                </button>
                <h3 className="text-sm font-medium">Confirm Changes</h3>
                <div className="w-16" />
              </div>

              <div className="space-y-3">
                {/* Old time */}
                <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/20">
                  <p className="text-xs text-red-400 mb-1">Current Appointment</p>
                  <p className="font-medium text-red-300 line-through">
                    {format(currentDate, 'EEEE, MMMM d, yyyy')} at {format(currentDate, 'h:mm a')}
                  </p>
                </div>
                
                {/* New time */}
                <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                  <p className="text-xs text-green-400 mb-1">New Appointment</p>
                  <p className="font-medium text-green-300">
                    {format(selectedDate, 'EEEE, MMMM d, yyyy')} at {timeSlots.find(s => s.time === selectedTime)?.label}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm rounded-lg border border-white/10 hover:bg-white/5"
          >
            Cancel
          </button>
          
          {step === 'date' && (
            <GradientButton 
              onClick={() => setStep('time')} 
              disabled={!selectedDate}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next: Select Time
            </GradientButton>
          )}
          
          {step === 'time' && (
            <GradientButton 
              onClick={() => setStep('confirm')} 
              disabled={!selectedTime}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Next: Confirm
            </GradientButton>
          )}
          
          {step === 'confirm' && (
            <GradientButton onClick={handleReschedule} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Confirm Reschedule
            </GradientButton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface CancelAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment: Appointment;
  onSuccess?: () => void;
}

export function CancelAppointmentDialog({
  open,
  onOpenChange,
  appointment,
  onSuccess
}: CancelAppointmentDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      await appointmentsService.cancel(appointment.id);
      
      toast.success("Appointment cancelled", {
        description: "The appointment has been cancelled successfully."
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error("Failed to cancel appointment:", error);
      toast.error("Failed to cancel appointment", {
        description: "Please try again later"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-black/95 border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-400">
            <AlertTriangle className="text-red-500" />
            Cancel Appointment
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel this appointment?
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-white/5 rounded-lg p-4 border border-white/10">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="text-muted-foreground" size={20} />
              <div>
                <p className="font-medium">
                  {format(new Date(appointment.scheduledAt), 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-sm text-muted-foreground">
                  at {format(new Date(appointment.scheduledAt), 'h:mm a')}
                </p>
              </div>
            </div>
            {appointment.notes && (
              <p className="text-sm text-muted-foreground mt-2">{appointment.notes}</p>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground mt-4">
            This action cannot be undone. You'll need to schedule a new appointment if you want to meet at another time.
          </p>
        </div>

        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm rounded-lg border border-white/10 hover:bg-white/5"
          >
            Keep Appointment
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="px-4 py-2 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors disabled:opacity-50 flex items-center"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Cancel Appointment
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
