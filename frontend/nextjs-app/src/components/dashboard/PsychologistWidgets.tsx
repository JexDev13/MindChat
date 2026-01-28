"use client";

import { GlassCard } from "@/components/shared/GlassCard";
import { Users, Calendar, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export function PsychologistWidgets() {
  const stats = [
    { label: "Total Patients", value: "24", icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Appointments Today", value: "5", icon: Calendar, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Hours This Week", value: "32", icon: Clock, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Patient Satisfaction", value: "4.9", icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <GlassCard className="p-4 flex items-center justify-between" hover>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-full ${stat.bg} ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <GlassCard className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="text-purple-500" /> Today&apos;s Schedule
            </h3>
            <span className="text-sm text-muted-foreground">Oct 15, 2023</span>
          </div>

          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all">
                <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-sm font-bold">1{i}:00</span>
                  <span className="text-xs text-muted-foreground">PM</span>
                </div>
                
                <div className="flex-1">
                  <h4 className="font-bold">Patient Name {i}</h4>
                  <p className="text-sm text-muted-foreground">Anxiety Management • Follow-up</p>
                </div>
                
                <div className="flex gap-2">
                   <button className="px-4 py-2 rounded-lg bg-purple-600 text-white text-sm font-medium hover:bg-purple-700 transition-colors">
                     Join
                   </button>
                   <button className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm transition-colors">
                     Details
                   </button>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Action Items / Requests */}
        <GlassCard>
           <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <AlertCircle className="text-orange-500" /> Action Items
           </h3>
           
           <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="p-3 rounded-lg bg-orange-500/5 border border-orange-500/10">
                  <h5 className="font-medium text-sm">New Appointment Request</h5>
                  <p className="text-xs text-muted-foreground mt-1 mb-2">Patient X wants to book a session.</p>
                  <div className="flex gap-2">
                    <button className="text-xs bg-orange-500/20 text-orange-400 px-2 py-1 rounded hover:bg-orange-500/30">Accept</button>
                    <button className="text-xs text-muted-foreground px-2 py-1 hover:text-white">Decline</button>
                  </div>
                </div>
              ))}
              
              <div className="p-3 rounded-lg bg-blue-500/5 border border-blue-500/10">
                 <h5 className="font-medium text-sm">Session Notes Pending</h5>
                 <p className="text-xs text-muted-foreground mt-1">Complete notes for session with Patient Y.</p>
              </div>
           </div>
        </GlassCard>
      </div>
    </div>
  );
}
