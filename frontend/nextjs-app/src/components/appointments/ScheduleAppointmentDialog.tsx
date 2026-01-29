"use client";

import { useEffect, useState } from "react";
import { format, addDays, startOfDay } from "date-fns";
import { Loader2, Calendar, Clock, FileText, ChevronLeft } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GradientButton } from "@/components/ui/gradient-button";
import { appointmentsService } from "@/lib/api/appointments.service";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ScheduleAppointmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate?: Date; // Now optional - dialog has its own date picker
  patientId: string;
  psychologistId: string;
  psychologistName?: string;
  pendingApproval?: boolean;
  onSuccess?: () => void;
}

const PENDING_PREFIX = "[PENDING_APPROVAL]";

export function ScheduleAppointmentDialog({
  open,
  onOpenChange,
  selectedDate: initialDate,
  patientId,
  psychologistId,
  psychologistName,
  pendingApproval = false,
  onSuccess
}: ScheduleAppointmentDialogProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate || null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'date' | 'time' | 'confirm'>('date');

  useEffect(() => {
    if (!open) return;
    setSelectedDate(initialDate || null);
    setSelectedTime(null);
    setNotes("");
    setStep('date');
  }, [open, initialDate]);

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

  const handleSchedule = async () => {
    if (!patientId || !psychologistId || !selectedDate || !selectedTime) {
      toast.error("Please select a date and time");
      return;
    }

    setLoading(true);
    try {
      const [hours, minutes] = selectedTime.split(":").map(Number);
      const scheduledAt = new Date(selectedDate);
      scheduledAt.setHours(hours, minutes, 0, 0);

      const pendingNotes = pendingApproval
        ? `${PENDING_PREFIX}${notes ? ` ${notes}` : ""}`
        : notes || undefined;

      await appointmentsService.create({
        patientId,
        psychologistId,
        scheduledAt: scheduledAt.toISOString(),
        notes: pendingNotes || undefined
      });

      toast.success(pendingApproval ? "Request sent!" : "Appointment scheduled!", {
        description: pendingApproval
          ? `Your request is pending approval for ${format(scheduledAt, "MMMM d, yyyy 'at' h:mm a")}`
          : `Your appointment is set for ${format(scheduledAt, "MMMM d, yyyy 'at' h:mm a")}`
      });

      onOpenChange(false);
      onSuccess?.();
      
      // Reset form
      resetForm();
    } catch (error) {
      console.error("Failed to schedule appointment:", error);
      toast.error("Failed to schedule appointment", {
        description: "Please try again later"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedDate(null);
    setSelectedTime(null);
    setNotes("");
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
            <Calendar className="text-purple-500" />
            Schedule Appointment
          </DialogTitle>
          <DialogDescription>
            Book a session {psychologistName ? `with ${psychologistName}` : ""}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
              step === 'date' ? "bg-purple-500 text-white" : selectedDate ? "bg-green-500 text-white" : "bg-white/10 text-muted-foreground"
            )}>1</div>
            <div className="w-8 h-0.5 bg-white/10" />
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
              step === 'time' ? "bg-purple-500 text-white" : selectedTime ? "bg-green-500 text-white" : "bg-white/10 text-muted-foreground"
            )}>2</div>
            <div className="w-8 h-0.5 bg-white/10" />
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
              step === 'confirm' ? "bg-purple-500 text-white" : "bg-white/10 text-muted-foreground"
            )}>3</div>
          </div>

          {/* Step 1: Date Selection */}
          {step === 'date' && (
            <div className="space-y-4">
              <h3 className="text-sm font-medium flex items-center gap-2 mb-4">
                <Calendar size={16} className="text-purple-400" />
                Select a Date
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
                        ? "bg-purple-500 border-purple-400 text-white"
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
                  <Clock size={16} className="text-purple-400" />
                  Select Time for {selectedDate && format(selectedDate, 'MMM d')}
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
                        ? "bg-purple-500 border-purple-400 text-white"
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
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                <h3 className="text-sm font-medium">Confirm Appointment</h3>
                <div className="w-16" />
              </div>

              <div className="bg-white/5 rounded-lg p-4 border border-white/10 space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="text-purple-400" size={20} />
                  <div>
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="font-medium">{format(selectedDate, 'EEEE, MMMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="text-blue-400" size={20} />
                  <div>
                    <p className="text-xs text-muted-foreground">Time</p>
                    <p className="font-medium">
                      {timeSlots.find(s => s.time === selectedTime)?.label || selectedTime}
                    </p>
                  </div>
                </div>
                {psychologistName && (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-xs">
                      {psychologistName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Psychologist</p>
                      <p className="font-medium">{psychologistName}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <FileText size={14} className="text-muted-foreground" />
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any specific topics you'd like to discuss..."
                  className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
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
            >
              Next: Select Time
            </GradientButton>
          )}
          
          {step === 'time' && (
            <GradientButton 
              onClick={() => setStep('confirm')} 
              disabled={!selectedTime}
            >
              Next: Confirm
            </GradientButton>
          )}
          
          {step === 'confirm' && (
            <GradientButton onClick={handleSchedule} disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Schedule Appointment
            </GradientButton>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
