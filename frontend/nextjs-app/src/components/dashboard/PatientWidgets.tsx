"use client";

import { GlassCard } from "@/components/shared/GlassCard";
import { GradientButton } from "@/components/ui/gradient-button";
import { Calendar, Clock, MessageSquare, Video, ArrowRight, Loader2, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { psychologistsService, PsychologistProfile } from "@/lib/api/clinical.service";
import { appointmentsService, Appointment } from "@/lib/api/appointments.service";
import { sessionRequestsService, chatsService } from "@/lib/api/chat-rest.service";
import { usersService, UserInfo } from "@/lib/api/users.service";
import { useAuthStore } from "@/lib/store/auth.store";
import { toast } from "sonner";
import { RescheduleAppointmentDialog, CancelAppointmentDialog } from "@/components/appointments/AppointmentManageDialogs";
import { ContactPsychologistDialog } from "@/components/psychologists/ContactPsychologistDialog";
import { ScheduleAppointmentDialog } from "@/components/appointments/ScheduleAppointmentDialog";

// Extended psychologist profile with patient count and user info
interface PsychologistWithDetails extends PsychologistProfile {
  patientCount: number;
  hasActiveRequest?: boolean;
  requestStatus?: 'Pending' | 'Accepted' | 'Rejected';
  chatId?: string | null;
  userInfo?: UserInfo;
}

export function PatientWidgets() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  
  // Real data states
  const [psychologists, setPsychologists] = useState<PsychologistWithDetails[]>([]);
  const [loadingPsychologists, setLoadingPsychologists] = useState(true);
  const [upcomingAppointment, setUpcomingAppointment] = useState<Appointment | null>(null);
  const [loadingAppointment, setLoadingAppointment] = useState(true);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);
  const [selectedPsychologist, setSelectedPsychologist] = useState<PsychologistWithDetails | null>(null);

  const refreshAppointments = async () => {
    if (!user?.profileId) return;
    try {
      const appointments = await appointmentsService.getByPatient(user.profileId);
      const now = new Date();
      const upcoming = appointments
        .filter(a => new Date(a.scheduledAt) > now && !a.isCancelled)
        .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
      setUpcomingAppointment(upcoming || null);
    } catch (error) {
      console.error('Failed to refresh appointments:', error);
    }
  };

  useEffect(() => {
    // Fetch recommended psychologists with patient count and user info
    const fetchPsychologists = async () => {
      try {
        console.log('[PatientWidgets] Fetching psychologists...');
        // Get all psychologists
        const allPsychologists = await psychologistsService.getAll();
        console.log('[PatientWidgets] Fetched psychologists:', allPsychologists.length);
        
        // Get user info for all psychologists (batch request)
        const userIds = allPsychologists.map(p => p.userId);
        let userInfoMap: Map<string, UserInfo> = new Map();
        try {
          const userInfoList = await usersService.getByIds(userIds);
          userInfoList.forEach(info => userInfoMap.set(info.userId, info));
          console.log('[PatientWidgets] Fetched user info for', userInfoList.length, 'psychologists');
        } catch (error) {
          console.error('[PatientWidgets] Failed to fetch user info:', error);
        }
        
        // Get patient's existing session requests
        let patientRequests: any[] = [];
        if (user?.profileId) {
          try {
            patientRequests = await sessionRequestsService.getByPatient(user.profileId);
            console.log('[PatientWidgets] Patient requests:', patientRequests.length);
          } catch (error) {
            console.error('[PatientWidgets] Failed to fetch patient requests:', error);
          }
        }
        
        // For each psychologist, fetch their accepted session requests to count patients
        const psychologistsWithDetails = await Promise.all(
          allPsychologists.map(async (psych) => {
            try {
              const sessionRequests = await sessionRequestsService.getByPsychologist(psych.profileId);
              // Count only accepted session requests (active patients)
              const acceptedPatients = sessionRequests.filter(req => req.status === 'Accepted');
              // Check if current patient has an active request with this psychologist
              const patientRequest = patientRequests.find(
                req => req.assignedPsychologistId === psych.profileId
              );
              const hasActiveRequest = patientRequest && patientRequest.status !== 'Rejected';
              let chatId: string | null = null;
              if (patientRequest?.status === 'Accepted') {
                try {
                  const chat = await chatsService.getBySessionRequest(patientRequest.id);
                  chatId = chat.id;
                } catch {
                  chatId = null;
                }
              }
              return {
                ...psych,
                patientCount: acceptedPatients.length,
                hasActiveRequest,
                requestStatus: patientRequest?.status,
                chatId,
                userInfo: userInfoMap.get(psych.userId)
              };
            } catch (error) {
              console.error(`[PatientWidgets] Failed to fetch patient count for psychologist ${psych.profileId}:`, error);
              return {
                ...psych,
                patientCount: 0,
                hasActiveRequest: false,
                requestStatus: undefined,
                chatId: null,
                userInfo: userInfoMap.get(psych.userId)
              };
            }
          })
        );
        
        console.log('[PatientWidgets] Psychologists with details:', psychologistsWithDetails);
        
        // Filter to show only psychologists with less than 40 patients and sort by patient count
        const availablePsychologists = psychologistsWithDetails
          .filter(psych => psych.patientCount < 40)
          .sort((a, b) => a.patientCount - b.patientCount); // Show psychologists with fewer patients first
        
        console.log('[PatientWidgets] Available psychologists:', availablePsychologists.length);
        setPsychologists(availablePsychologists);
      } catch (error) {
        console.error('[PatientWidgets] Failed to fetch psychologists:', error);
        toast.error('Failed to load psychologists', {
          description: error instanceof Error ? error.message : 'Please try again later'
        });
      } finally {
        setLoadingPsychologists(false);
      }
    };

    // Fetch upcoming appointment
    const fetchAppointment = async () => {
      if (!user?.profileId) {
        setLoadingAppointment(false);
        return;
      }
      try {
        const appointments = await appointmentsService.getByPatient(user.profileId);
        // Get the next upcoming appointment
        const now = new Date();
        const upcoming = appointments
          .filter(a => new Date(a.scheduledAt) > now && !a.isCancelled)
          .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];
        setUpcomingAppointment(upcoming || null);
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      } finally {
        setLoadingAppointment(false);
      }
    };

    fetchPsychologists();
    fetchAppointment();
  }, [user?.profileId]);

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
              
              {loadingAppointment ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                </div>
              ) : upcomingAppointment ? (
                <>
                  <div className="flex flex-col sm:flex-row gap-6 items-center">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16 border-2 border-purple-500">
                        <AvatarFallback>PS</AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-bold text-lg">Session</h4>
                        <p className="text-muted-foreground">{upcomingAppointment.notes || 'Scheduled appointment'}</p>
                      </div>
                    </div>
                    
                    <div className="flex-1 w-full sm:w-auto bg-white/5 rounded-xl p-4 flex justify-between items-center border border-white/10">
                      <div className="flex items-center gap-3">
                        <Clock className="text-blue-500" />
                        <div>
                          <p className="font-medium">{new Date(upcomingAppointment.scheduledAt).toLocaleDateString()}</p>
                          <p className="text-sm text-muted-foreground">{new Date(upcomingAppointment.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-xs font-medium">
                        {upcomingAppointment.isCancelled ? 'Cancelled' : 'Scheduled'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6 flex gap-4">
                    <GradientButton className="flex-1">
                      Join Session
                    </GradientButton>
                    <button 
                      onClick={() => setShowRescheduleDialog(true)}
                      className="px-6 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors font-medium"
                    >
                      Reschedule
                    </button>
                  </div>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No upcoming sessions scheduled</p>
                  <GradientButton onClick={() => router.push('/appointments')}>
                    Book a Session
                  </GradientButton>
                </div>
              )}
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
                <MessageSquare className="text-blue-500" /> Messages
              </h3>
              <button onClick={() => router.push('/chat')} className="text-xs text-purple-400 hover:text-purple-300">View All</button>
            </div>

            <div className="text-center py-6">
              <p className="text-muted-foreground text-sm mb-4">Start a conversation with your psychologist</p>
              <button onClick={() => router.push('/chat')} className="text-sm font-medium text-purple-400 flex items-center justify-center gap-1 hover:gap-2 transition-all mx-auto">
                Go to Chat <ArrowRight size={14} />
              </button>
            </div>
          </GlassCard>
        </motion.div>
      </div>

      {/* Recommended Psychologists Section */}
      <h3 className="text-xl font-bold mt-8 mb-4">Recommended for you</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
         {loadingPsychologists ? (
           <div className="col-span-full flex justify-center py-8">
             <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
           </div>
         ) : psychologists.length > 0 ? (
           psychologists.slice(0, 8).map((psych) => {
             const displayName = psych.userInfo?.fullName || 'Licensed Professional';
             const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'PS';
             const profilePicture = psych.userInfo?.profilePictureUrl;
             
             return (
             <GlassCard key={psych.profileId} className="p-4" hover>
                <div className="flex flex-col items-center text-center">
                   <Avatar className="h-20 w-20 mb-3 border-2 border-blue-500/30">
                      {profilePicture ? (
                        <AvatarImage src={profilePicture} alt={displayName} />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-lg">
                        {initials}
                      </AvatarFallback>
                   </Avatar>
                   <h4 className="font-bold">{displayName}</h4>
                   <p className="text-xs text-muted-foreground mb-1">{psych.university || 'Licensed Professional'}</p>
                   <div className="flex items-center gap-2 mb-1">
                     {psych.isVerified && (
                       <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full">✓ Verified</span>
                     )}
                   </div>
                   <p className="text-xs text-green-400 mb-2">{psych.patientCount}/40 patients</p>
                   {psych.tags && psych.tags.length > 0 && (
                     <div className="flex flex-wrap gap-1 justify-center mb-3">
                       {psych.tags.slice(0, 2).map((tag, tagIndex) => (
                         <span key={tagIndex} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                           {tag}
                         </span>
                       ))}
                     </div>
                   )}
                   {psych.hasActiveRequest ? (
                     <div className="w-full space-y-2">
                       {psych.requestStatus === 'Pending' && (
                         <span className="text-xs bg-yellow-500/20 text-yellow-400 px-3 py-1 rounded-full inline-block">
                           Chat Request Pending
                         </span>
                       )}
                       {psych.requestStatus === 'Accepted' && (
                         <span className="text-xs bg-green-500/20 text-green-400 px-3 py-1 rounded-full inline-block">
                           Connected
                         </span>
                       )}
                       {/* Schedule Appointment - Main Action */}
                       <GradientButton 
                         className="w-full py-2 h-auto text-sm"
                         onClick={() => {
                           setSelectedPsychologist(psych);
                           setShowScheduleDialog(true);
                         }}
                       >
                         <Calendar size={14} className="mr-1" /> Schedule Appointment
                       </GradientButton>
                       {/* Go to Chat - Secondary Action */}
                       <button 
                         className="w-full py-2 h-auto text-xs border border-white/10 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-center gap-1"
                         onClick={() => {
                           if (psych.chatId) {
                             router.push(`/chat/${psych.chatId}`);
                           } else {
                             toast.info('Chat not available yet', {
                               description: 'The psychologist must accept your request first.'
                             });
                           }
                         }}
                         disabled={!psych.chatId}
                       >
                         <MessageSquare size={12} /> {psych.chatId ? 'Open Chat' : 'Chat Pending'}
                       </button>
                     </div>
                   ) : (
                     <div className="w-full space-y-2">
                       {/* Schedule Appointment - Main Action */}
                       <GradientButton 
                         className="w-full py-2 h-auto text-sm"
                         onClick={() => {
                           setSelectedPsychologist(psych);
                           setShowScheduleDialog(true);
                         }}
                       >
                         <Calendar size={14} className="mr-1" /> Schedule Appointment
                       </GradientButton>
                       {/* Contact for Chat - Secondary Action */}
                       <button
                         className="w-full py-2 text-xs border border-white/10 rounded-lg hover:bg-white/5 transition-colors flex items-center justify-center gap-1"
                         onClick={() => {
                           setSelectedPsychologist(psych);
                           setShowContactDialog(true);
                         }}
                       >
                         <MessageSquare size={12} /> Contact for Chat
                       </button>
                       <button
                         className="w-full py-1 text-xs text-purple-400 hover:text-purple-300"
                         onClick={() => router.push(`/psychologists/${psych.profileId}`)}
                       >
                         View Profile
                       </button>
                     </div>
                   )}
                </div>
             </GlassCard>
             );
           })
         ) : (
           <div className="col-span-full text-center py-8">
             <p className="text-muted-foreground">No psychologists available at the moment. All psychologists are at full capacity.</p>
           </div>
         )}
      </div>

      {/* Contact Psychologist Dialog */}
      {user?.profileId && selectedPsychologist && (
        <ContactPsychologistDialog
          open={showContactDialog}
          onOpenChange={(open) => {
            setShowContactDialog(open);
            if (!open) setSelectedPsychologist(null);
          }}
          patientId={user.profileId}
          psychologistId={selectedPsychologist.profileId}
          psychologistName={selectedPsychologist.userInfo?.fullName || 'Psychologist'}
          onSuccess={() => window.location.reload()}
        />
      )}

      {/* Schedule Appointment Dialog */}
      {user?.profileId && selectedPsychologist && (
        <ScheduleAppointmentDialog
          open={showScheduleDialog}
          onOpenChange={(open) => {
            setShowScheduleDialog(open);
            if (!open) setSelectedPsychologist(null);
          }}
          patientId={user.profileId}
          psychologistId={selectedPsychologist.profileId}
          psychologistName={selectedPsychologist.userInfo?.fullName || 'Psychologist'}
          pendingApproval={true}
          onSuccess={() => {
            refreshAppointments();
            toast.success('Appointment request sent!', {
              description: 'The psychologist will review your request.'
            });
          }}
        />
      )}

      {/* Reschedule Dialog */}
      {upcomingAppointment && (
        <RescheduleAppointmentDialog
          open={showRescheduleDialog}
          onOpenChange={setShowRescheduleDialog}
          appointment={upcomingAppointment}
          onSuccess={refreshAppointments}
        />
      )}

      {/* Cancel Dialog */}
      {upcomingAppointment && (
        <CancelAppointmentDialog
          open={showCancelDialog}
          onOpenChange={setShowCancelDialog}
          appointment={upcomingAppointment}
          onSuccess={refreshAppointments}
        />
      )}
    </div>
  );
}
