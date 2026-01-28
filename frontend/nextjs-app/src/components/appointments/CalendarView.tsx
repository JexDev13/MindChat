"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday } from "date-fns";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { GlassCard } from "@/components/shared/GlassCard";
import { GradientButton } from "@/components/ui/gradient-button";

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

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

  // Mock appointments
  const appointments = [
    new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
    new Date(currentDate.getFullYear(), currentDate.getMonth(), 20),
  ];

  const hasAppointment = (day: Date) => {
    return appointments.some(appt => isSameDay(appt, day));
  };

  return (
    <div className="flex flex-col h-full">
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
          <div className="w-4" />
          <GradientButton className="h-10 px-4 flex items-center gap-2">
            <Plus size={16} /> New Appointment
          </GradientButton>
        </div>
      </div>

      <GlassCard className="flex-1 p-0 overflow-hidden flex flex-col">
        <div className="grid grid-cols-7 border-b border-white/10">
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
            const hasAppt = hasAppointment(day);

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
                
                {hasAppt && (
                  <div className="w-full">
                    <div className="bg-blue-500/20 border border-blue-500/30 rounded px-2 py-1 mb-1">
                      <p className="text-[10px] text-blue-300 truncate font-medium">Dr. Wilson</p>
                      <p className="text-[10px] text-blue-400 truncate">2:00 PM</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
}
