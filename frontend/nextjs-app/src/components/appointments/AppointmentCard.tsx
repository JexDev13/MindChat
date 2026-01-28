"use client";

import { GlassCard } from "@/components/shared/GlassCard";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GradientButton } from "@/components/ui/gradient-button";
import { Calendar, Clock, Video, MoreHorizontal } from "lucide-react";

interface AppointmentCardProps {
  id: string;
  doctorName: string;
  doctorImage: string;
  specialty: string;
  date: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
}

export function AppointmentCard({ doctorName, doctorImage, specialty, date, time, status }: AppointmentCardProps) {
  return (
    <GlassCard className="p-4" hover>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border border-white/10">
            <AvatarImage src={doctorImage} />
            <AvatarFallback>{doctorName[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-bold text-sm">{doctorName}</h4>
            <p className="text-xs text-muted-foreground">{specialty}</p>
          </div>
        </div>
        <button className="text-muted-foreground hover:text-white">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="space-y-2 mb-6">
        <div className="flex items-center gap-2 text-sm">
          <Calendar size={16} className="text-purple-500" />
          <span>{date}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock size={16} className="text-blue-500" />
          <span>{time}</span>
        </div>
      </div>

      <div className="flex gap-2">
        {status === 'upcoming' ? (
          <>
            <GradientButton className="flex-1 py-2 h-9 text-xs">
              <Video size={14} className="mr-2" /> Join
            </GradientButton>
            <button className="px-3 py-1 rounded-lg border border-white/10 hover:bg-white/5 text-xs font-medium transition-colors">
              Reschedule
            </button>
          </>
        ) : (
          <button className="w-full py-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium transition-colors">
            View Details
          </button>
        )}
      </div>
    </GlassCard>
  );
}
