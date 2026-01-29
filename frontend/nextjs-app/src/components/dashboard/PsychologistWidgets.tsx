"use client";

import { GlassCard } from "@/components/shared/GlassCard";
import { Users, Calendar, TrendingUp, Clock, AlertCircle, Loader2, Check, X, MessageSquare, ArrowRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { sessionRequestsService, chatsService, SessionRequest } from "@/lib/api/chat-rest.service";
import { appointmentsService, Appointment } from "@/lib/api/appointments.service";
import { patientsService, PatientProfile } from "@/lib/api/clinical.service";
import { usersService, UserInfo } from "@/lib/api/users.service";
import { useAuthStore } from "@/lib/store/auth.store";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { GradientButton } from "@/components/ui/gradient-button";

interface SessionRequestWithPatient extends SessionRequest {
  patientInfo?: PatientProfile;
  userInfo?: UserInfo;
}

export function PsychologistWidgets() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  
  // Real data states
  const [sessionRequests, setSessionRequests] = useState<SessionRequest[]>([]);
  const [pendingRequests, setPendingRequests] = useState<SessionRequestWithPatient[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientCount, setPatientCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [processingRequest, setProcessingRequest] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user?.profileId) {
        setLoading(false);
        return;
      }
      
      try {
        // Fetch session requests for this psychologist
        const requests = await sessionRequestsService.getByPsychologist(user.profileId);
        setSessionRequests(requests);
        
        // Filter pending requests
        const pending = requests.filter(r => r.status === 'Pending');
        
        // Count unique patients from accepted session requests
        const acceptedRequests = requests.filter(r => r.status === 'Accepted');
        const uniquePatients = new Set(acceptedRequests.map(r => r.patientId));
        setPatientCount(uniquePatients.size);
        
        // Fetch patient info for pending requests
        const enrichedPending = await Promise.all(
          pending.map(async (req) => {
            try {
              const patientProfile = await patientsService.getById(req.patientId);
              const userInfo = await usersService.getById(patientProfile.userId);
              return { ...req, patientInfo: patientProfile, userInfo };
            } catch (error) {
              console.error('Failed to fetch patient info:', error);
              return { ...req };
            }
          })
        );
        setPendingRequests(enrichedPending);
        
        // Fetch today's appointments
        const allAppointments = await appointmentsService.getByPsychologist(user.profileId);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        const todayAppointments = allAppointments.filter(a => {
          const appointmentDate = new Date(a.scheduledAt);
          return appointmentDate >= today && appointmentDate < tomorrow && !a.isCancelled;
        });
        setAppointments(todayAppointments);
      } catch (error) {
        console.error('Failed to fetch psychologist data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.profileId]);

  const handleAcceptRequest = async (request: SessionRequestWithPatient) => {
    setProcessingRequest(request.id);
    try {
      // Update status to Accepted
      await sessionRequestsService.updateStatus(request.id, { status: 'Accepted' });
      
      // Create chat for this session request
      const chat = await chatsService.create({ sessionRequestId: request.id });
      console.log('[PsychologistWidgets] Created chat:', chat.id);
      
      toast.success('Request accepted!', {
        description: request.userInfo ? 
          `You can now chat with ${request.userInfo.fullName}` : 
          'You can now chat with this patient',
        action: {
          label: 'Open Chat',
          onClick: () => router.push(`/chat/${chat.id}`)
        }
      });
      
      // Refresh pending requests
      setPendingRequests(prev => prev.filter(r => r.id !== request.id));
      setPatientCount(prev => prev + 1);
    } catch (error) {
      console.error('Failed to accept request:', error);
      toast.error('Failed to accept request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const handleDeclineRequest = async (request: SessionRequestWithPatient) => {
    setProcessingRequest(request.id);
    try {
      await sessionRequestsService.updateStatus(request.id, { status: 'Rejected' });
      toast.success('Request declined');
      setPendingRequests(prev => prev.filter(r => r.id !== request.id));
    } catch (error) {
      console.error('Failed to decline request:', error);
      toast.error('Failed to decline request');
    } finally {
      setProcessingRequest(null);
    }
  };

  const getPatientName = (request: SessionRequestWithPatient): string => {
    if (request.userInfo) {
      return request.userInfo.fullName;
    }
    return 'Patient';
  };

  const getPatientInitials = (request: SessionRequestWithPatient): string => {
    if (request.userInfo?.fullName) {
      const parts = request.userInfo.fullName.split(' ');
      return parts.map(p => p[0]).join('').toUpperCase().slice(0, 2);
    }
    return 'P';
  };

  const stats = [
    { label: "Total Patients", value: patientCount.toString(), icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Appointments Today", value: appointments.length.toString(), icon: Calendar, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Pending Requests", value: pendingRequests.length.toString(), icon: Clock, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Total Sessions", value: sessionRequests.filter(r => r.status === 'Accepted').length.toString(), icon: TrendingUp, color: "text-orange-500", bg: "bg-orange-500/10" },
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
            <span className="text-sm text-muted-foreground">{new Date().toLocaleDateString()}</span>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
              </div>
            ) : appointments.length > 0 ? (
              appointments.map((appointment) => {
                const appointmentTime = new Date(appointment.scheduledAt);
                return (
                  <div key={appointment.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all">
                    <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-sm font-bold">{appointmentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-bold">Session</h4>
                      <p className="text-sm text-muted-foreground">{appointment.notes || 'Scheduled session'}</p>
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
                );
              })
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No appointments scheduled for today</p>
              </div>
            )}
          </div>
        </GlassCard>

        {/* Action Items / Pending Requests */}
        <GlassCard>
           <h3 className="text-lg font-semibold flex items-center gap-2 mb-4">
              <AlertCircle className="text-orange-500" /> Pending Requests
              {pendingRequests.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-orange-500/20 text-orange-300 rounded-full">
                  {pendingRequests.length}
                </span>
              )}
           </h3>
           
           <div className="space-y-3">
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
                </div>
              ) : pendingRequests.length > 0 ? (
                <AnimatePresence>
                  {pendingRequests.map((request) => (
                    <motion.div 
                      key={request.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/10"
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-gradient-to-br from-orange-500 to-yellow-500 text-white text-sm">
                            {getPatientInitials(request)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-medium text-sm">{getPatientName(request)}</h5>
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {request.initialMessage || 'Would like to start a session'}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(request.createdAt), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <GradientButton 
                          size="sm"
                          onClick={() => handleAcceptRequest(request)}
                          disabled={processingRequest === request.id}
                          className="flex-1"
                        >
                          {processingRequest === request.id ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <Check size={12} className="mr-1" />
                          )}
                          Accept
                        </GradientButton>
                        <button 
                          onClick={() => handleDeclineRequest(request)}
                          disabled={processingRequest === request.id}
                          className="flex-1 text-xs border border-white/10 px-3 py-2 rounded-lg hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-colors disabled:opacity-50"
                        >
                          <X size={12} className="inline mr-1" />
                          Decline
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground">No pending requests</p>
                </div>
              )}
           </div>
           
           {/* Quick action to view chats */}
           <button
             onClick={() => router.push('/chat')}
             className="w-full mt-4 py-2 text-sm text-center text-muted-foreground hover:text-white transition-colors flex items-center justify-center gap-1 border-t border-white/5 pt-4"
           >
             <MessageSquare size={14} /> View Patient Chats <ArrowRight size={14} />
           </button>
        </GlassCard>
      </div>
    </div>
  );
}
