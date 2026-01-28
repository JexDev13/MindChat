"use client";

import { GlassCard } from "@/components/shared/GlassCard";
import { GradientButton } from "@/components/ui/gradient-button";
import { Calendar, Clock, MessageSquare, Video, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export function PatientWidgets() {
  const router = useRouter();

  // Mock data
  const upcomingAppointment = {
    psychologist: {
      name: "Dr. Sarah Wilson",
      image: "https://i.pravatar.cc/150?u=sarah",
      specialty: "Anxiety Specialist"
    },
    date: "Today, 15 Oct",
    time: "14:00 - 15:00",
    minutesLeft: 45
  };

  const recentChats = [
    { id: 1, name: "Dr. Sarah Wilson", message: "How have you been feeling since...", time: "10:30 AM", unread: 2 },
    { id: 2, name: "MindChat Support", message: "Your appointment is confirmed.", time: "Yesterday", unread: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Session Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="lg:col-span-2"
        >
          <GlassCard className="h-full relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Video size={120} />
            </div>
            
            <div className="relative z-10">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Calendar className="text-purple-500" /> Upcoming Session
              </h3>
              
              <div className="flex flex-col sm:flex-row gap-6 items-center">
                <div className="flex items-center gap-4">
                  <Avatar className="h-16 w-16 border-2 border-purple-500">
                    <AvatarImage src={upcomingAppointment.psychologist.image} />
                    <AvatarFallback>SW</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-bold text-lg">{upcomingAppointment.psychologist.name}</h4>
                    <p className="text-muted-foreground">{upcomingAppointment.psychologist.specialty}</p>
                  </div>
                </div>
                
                <div className="flex-1 w-full sm:w-auto bg-white/5 rounded-xl p-4 flex justify-between items-center border border-white/10">
                  <div className="flex items-center gap-3">
                    <Clock className="text-blue-500" />
                    <div>
                      <p className="font-medium">{upcomingAppointment.date}</p>
                      <p className="text-sm text-muted-foreground">{upcomingAppointment.time}</p>
                    </div>
                  </div>
                  <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-medium animate-pulse">
                    Starts in {upcomingAppointment.minutesLeft}m
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <GradientButton className="flex-1">
                  Join Session
                </GradientButton>
                <button className="px-6 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors font-medium">
                  Reschedule
                </button>
              </div>
            </div>
          </GlassCard>
        </motion.div>

        {/* Recent Chats Widget */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <GlassCard className="h-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="text-blue-500" /> Recent Chats
              </h3>
              <button onClick={() => router.push('/chat')} className="text-xs text-purple-400 hover:text-purple-300">View All</button>
            </div>

            <div className="space-y-4">
              {recentChats.map((chat) => (
                <div key={chat.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer" onClick={() => router.push(`/chat/${chat.id}`)}>
                  <Avatar>
                    <AvatarFallback>{chat.name[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <p className="font-medium text-sm truncate">{chat.name}</p>
                      <span className="text-xs text-muted-foreground">{chat.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{chat.message}</p>
                  </div>
                  {chat.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center text-[10px] font-bold text-white">
                      {chat.unread}
                    </span>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10 text-center">
               <button onClick={() => router.push('/chat')} className="text-sm font-medium text-purple-400 flex items-center justify-center gap-1 hover:gap-2 transition-all">
                 Start New Conversation <ArrowRight size={14} />
               </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Recommended Psychologists Section could go here */}
      <h3 className="text-xl font-bold mt-8 mb-4">Recommended for you</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {[1, 2, 3, 4].map((i) => (
           <GlassCard key={i} className="p-4" hover>
              <div className="flex flex-col items-center text-center">
                 <Avatar className="h-20 w-20 mb-3 border-2 border-blue-500/30">
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${i}`} />
                    <AvatarFallback>DR</AvatarFallback>
                 </Avatar>
                 <h4 className="font-bold">Dr. Name {i}</h4>
                 <p className="text-xs text-muted-foreground mb-3">Clinical Psychologist</p>
                 <GradientButton variant="secondary" className="w-full py-2 h-auto text-sm">
                   View Profile
                 </GradientButton>
              </div>
           </GlassCard>
         ))}
      </div>
    </div>
  );
}
