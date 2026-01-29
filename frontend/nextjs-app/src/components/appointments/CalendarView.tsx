"use client";

import { useState, useEffect } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Plus, Loader2, Calendar as CalendarIcon, MoreHorizontal, RefreshCw, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/shared/GlassCard";
import { GradientButton } from "@/components/ui/gradient-button";
import { appointmentsService, Appointment } from "@/lib/api/appointments.service";
import { psychologistsService } from "@/lib/api/clinical.service";
import { usersService } from "@/lib/api/users.service";
import { useAuthStore } from "@/lib/store/auth.store";
import { toast } from "sonner";
import { ScheduleAppointmentDialog } from "./ScheduleAppointmentDialog";
import { RescheduleAppointmentDialog, CancelAppointmentDialog } from "./AppointmentManageDialogs";
import { useSearchParams } from "next/navigation";

interface PsychologistOption {
  id: string;
  name: string;
  userId: string;
}

const PENDING_PREFIX = "[PENDING_APPROVAL]";

const isPendingAppointment = (appointment: Appointment) =>
  !!appointment.notes && appointment.notes.startsWith(PENDING_PREFIX);

const getAppointmentNotes = (appointment: Appointment) =>
  appointment.notes
    ? appointment.notes.replace(PENDING_PREFIX, "").trim()
    : "";

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [availablePsychologists, setAvailablePsychologists] = useState<PsychologistOption[]>([]);
  const [selectedPsychologistId, setSelectedPsychologistId] = useState<string | null>(null);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const user = useAuthStore((state) => state.user);
  const searchParams = useSearchParams();

  const fetchAppointments = async () => {
    if (!user?.profileId) {
      setLoading(false);
      return;
    }

    try {
      console.log('[CalendarView] Fetching appointments for:', user.profileId, 'Type:', user.userType);
      let appts: Appointment[] = [];
      
      if (user.userType === 'patient') {
        appts = await appointmentsService.getByPatient(user.profileId);
      } else if (user.userType === 'psychologist') {
        appts = await appointmentsService.getByPsychologist(user.profileId);
      }
      
      console.log('[CalendarView] Fetched appointments:', appts.length);
      setAppointments(appts);
    } catch (error) {
      console.error('[CalendarView] Failed to fetch appointments:', error);
      toast.error('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user?.profileId, user?.userType]);

  useEffect(() => {
    const fetchPsychologists = async () => {
      if (user?.userType !== 'patient') return;

      try {
        const psychologists = await psychologistsService.getAll();
        const enriched = await Promise.all(
          psychologists.map(async (psych) => {
            let name = 'Psychologist';
            try {
              const info = await usersService.getById(psych.userId);
              name = info.fullName || name;
            } catch {
              // Ignore user info errors
            }
            return { id: psych.profileId, name, userId: psych.userId };
          })
        );

        setAvailablePsychologists(enriched);

        const preselectedId = searchParams?.get('psychologistId');
        if (preselectedId) {
          setSelectedPsychologistId(preselectedId);
        } else if (!selectedPsychologistId && enriched.length > 0) {
          setSelectedPsychologistId(enriched[0].id);
        }
      } catch (error) {
        console.error('[CalendarView] Failed to fetch psychologists:', error);
      }
    };

    fetchPsychologists();
  }, [user?.userType, searchParams, selectedPsychologistId]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getAppointmentsForDay = (day: Date) => {
    return appointments.filter(appt => {
      const apptDate = new Date(appt.scheduledAt);
      return isSameDay(apptDate, day) && !appt.isCancelled;
    });
  };

  const selectedDayAppointments = getAppointmentsForDay(selectedDate);
  const selectedPsychologist = availablePsychologists.find(p => p.id === selectedPsychologistId) || null;

  return (
    <div className="flex gap-6 h-full">
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {format(currentDate, "MMMM yyyy")}
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={prevMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ChevronLeft size={20} />
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {loading ? (
          <GlassCard className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          </GlassCard>
        ) : (
          <GlassCard className="flex-1 p-0 overflow-hidden flex flex-col">\n            <div className="grid grid-cols-7 border-b border-white/10">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="p-4 text-center text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>
            <div className="flex-1 grid grid-cols-7 auto-rows-fr">
              {calendarDays.map((day, idx) => {
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isDayToday = isToday(day);
                const dayAppointments = getAppointmentsForDay(day);

                return (
                  <div
                    key={day.toString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "relative p-2 border-r border-b border-white/5 cursor-pointer transition-colors hover:bg-white/5 flex flex-col items-start min-h-[100px]",
                      !isCurrentMonth && "opacity-30 bg-black/20",
                      isSelected && "bg-purple-500/10"
                    )}
                  >
                    <span className={cn(
                      "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-2",
                      isDayToday ? "bg-purple-600 text-white" : "text-foreground",
                      isSelected && !isDayToday && "bg-white/10"
                    )}>
                      {format(day, "d")}
                    </span>
                    
                    {dayAppointments.length > 0 && (
                      <div className="w-full space-y-1">
                        {dayAppointments.slice(0, 2).map((appt) => {
                          const apptTime = format(new Date(appt.scheduledAt), "h:mm a");
                          const isPending = isPendingAppointment(appt);
                          return (
                            <div
                              key={appt.id}
                              className={cn(
                                "rounded px-2 py-1 border",
                                isPending
                                  ? "bg-yellow-500/20 border-yellow-500/30"
                                  : "bg-green-500/20 border-green-500/30"
                              )}
                            >
                              <p className={cn(
                                "text-[10px] truncate font-medium",
                                isPending ? "text-yellow-300" : "text-green-300"
                              )}>{apptTime}</p>
                              <p className={cn(
                                "text-[9px] truncate",
                                isPending ? "text-yellow-400" : "text-green-400"
                              )}>{isPending ? "Pending" : "Scheduled"}</p>
                            </div>
                          );
                        })}
                        {dayAppointments.length > 2 && (
                          <p className="text-[9px] text-muted-foreground">+{dayAppointments.length - 2} more</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        )}
      </div>

      {/* Selected Day Details */}
      <div className="w-80 flex flex-col space-y-4">
        <GlassCard className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <CalendarIcon size={20} className="text-purple-500" />
            {format(selectedDate, "EEEE, MMMM d")}
          </h3>
          
          {selectedDayAppointments.length > 0 ? (
            <div className="space-y-3">
              {selectedDayAppointments.map((appt) => {
                const apptTime = format(new Date(appt.scheduledAt), "h:mm a");
                const isFuture = new Date(appt.scheduledAt) > new Date();
                const isPending = isPendingAppointment(appt);
                const displayNotes = getAppointmentNotes(appt);
                return (
                  <div key={appt.id} className="bg-white/5 rounded-lg p-4 border border-white/10">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-medium">{apptTime}</span>
                      <span className={cn(
                        "text-xs px-2 py-1 rounded-full",
                        isPending ? "bg-yellow-500/20 text-yellow-300" : "bg-green-500/20 text-green-300"
                      )}>
                        {isPending ? "Pending approval" : "Scheduled"}
                      </span>
                    </div>
                    {displayNotes && (
                      <p className="text-xs text-muted-foreground mt-2 mb-3">{displayNotes}</p>
                    )}
                    {isFuture && !isPending && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                        <button
                          onClick={() => {
                            setSelectedAppointment(appt);
                            setShowRescheduleDialog(true);
                          }}
                          className="flex-1 text-xs py-1.5 px-2 rounded border border-white/10 hover:bg-blue-500/10 hover:border-blue-500/30 hover:text-blue-400 transition-colors flex items-center justify-center gap-1"
                        >
                          <RefreshCw size={12} /> Reschedule
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAppointment(appt);
                            setShowCancelDialog(true);
                          }}
                          className="flex-1 text-xs py-1.5 px-2 rounded border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors flex items-center justify-center gap-1"
                        >
                          <X size={12} /> Cancel
                        </button>
                      </div>
                    )}
                    {isFuture && isPending && user?.userType === 'psychologist' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                        <button
                          onClick={async () => {
                            try {
                              await appointmentsService.update(appt.id, {
                                notes: displayNotes || ""
                              });
                              toast.success('Appointment accepted');
                              fetchAppointments();
                            } catch (error) {
                              console.error('Failed to accept appointment:', error);
                              toast.error('Failed to accept appointment');
                            }
                          }}
                          className="flex-1 text-xs py-1.5 px-2 rounded border border-white/10 hover:bg-green-500/10 hover:border-green-500/30 hover:text-green-400 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await appointmentsService.cancel(appt.id);
                              toast.success('Appointment declined');
                              fetchAppointments();
                            } catch (error) {
                              console.error('Failed to decline appointment:', error);
                              toast.error('Failed to decline appointment');
                            }
                          }}
                          className="flex-1 text-xs py-1.5 px-2 rounded border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                    {isFuture && isPending && user?.userType === 'patient' && (
                      <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
                        <button
                          onClick={async () => {
                            try {
                              await appointmentsService.cancel(appt.id);
                              toast.success('Request cancelled');
                              fetchAppointments();
                            } catch (error) {
                              console.error('Failed to cancel request:', error);
                              toast.error('Failed to cancel request');
                            }
                          }}
                          className="flex-1 text-xs py-1.5 px-2 rounded border border-white/10 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors flex items-center justify-center gap-1"
                        >
                          <X size={12} /> Cancel Request
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              {user?.userType === 'patient' && selectedPsychologist && (
                <GradientButton
                  size="sm"
                  className="w-full"
                  onClick={() => setShowScheduleDialog(true)}
                >
                  <Plus size={14} className="mr-2" /> Book Session
                </GradientButton>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground mb-4">No appointments scheduled</p>
              {user?.userType === 'patient' && selectedPsychologist ? (
                <GradientButton 
                  size="sm" 
                  className="w-full"
                  onClick={() => setShowScheduleDialog(true)}
                >
                  <Plus size={14} className="mr-2" /> Schedule Appointment
                </GradientButton>
              ) : user?.userType === 'patient' ? (
                <p className="text-xs text-muted-foreground">
                  Select a psychologist to schedule an appointment
                </p>
              ) : null}
            </div>
          )}
        </GlassCard>

        {user?.userType === 'patient' && (
          <GlassCard className="p-6">
            <h4 className="text-sm font-bold mb-3 text-muted-foreground">Available Psychologists</h4>
            {availablePsychologists.length > 0 ? (
              <div className="space-y-2">
                {availablePsychologists.map((psych) => (
                  <button
                    key={psych.id}
                    onClick={() => setSelectedPsychologistId(psych.id)}
                    className={cn(
                      "w-full text-left text-xs rounded-lg p-2 border transition-colors",
                      selectedPsychologistId === psych.id
                        ? "border-purple-500/40 bg-purple-500/10"
                        : "border-white/10 hover:border-white/20 hover:bg-white/5"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{psych.name}</span>
                      {selectedPsychologistId === psych.id ? (
                        <span className="text-[10px] text-purple-400">Selected</span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground">Select</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No psychologists available right now.</p>
            )}
          </GlassCard>
        )}

        {appointments.length > 0 && (
          <GlassCard className="p-6">
            <h4 className="text-sm font-bold mb-3 text-muted-foreground">Upcoming Appointments</h4>
            <div className="space-y-2">
              {appointments
                .filter(a => new Date(a.scheduledAt) > new Date() && !a.isCancelled)
                .slice(0, 3)
                .map((appt) => (
                  <div key={appt.id} className="text-xs bg-white/5 rounded p-2">
                    <p className="font-medium">{format(new Date(appt.scheduledAt), "MMM d, h:mm a")}</p>
                    <p className="text-muted-foreground text-[10px]">Scheduled</p>
                  </div>
                ))}
            </div>
          </GlassCard>
        )}
      </div>

      {/* Schedule Appointment Dialog */}
      {user?.profileId && user.userType === 'patient' && selectedPsychologist && (
        <ScheduleAppointmentDialog
          open={showScheduleDialog}
          onOpenChange={setShowScheduleDialog}
          selectedDate={selectedDate}
          patientId={user.profileId}
          psychologistId={selectedPsychologist.id}
          psychologistName={selectedPsychologist.name}
          pendingApproval={true}
          onSuccess={fetchAppointments}
        />
      )}

      {/* Reschedule Dialog */}
      {selectedAppointment && (
        <RescheduleAppointmentDialog
          open={showRescheduleDialog}
          onOpenChange={(open) => {
            setShowRescheduleDialog(open);
            if (!open) setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
          onSuccess={fetchAppointments}
        />
      )}

      {/* Cancel Dialog */}
      {selectedAppointment && (
        <CancelAppointmentDialog
          open={showCancelDialog}
          onOpenChange={(open) => {
            setShowCancelDialog(open);
            if (!open) setSelectedAppointment(null);
          }}
          appointment={selectedAppointment}
          onSuccess={fetchAppointments}
        />
      )}
    </div>
  );
}
