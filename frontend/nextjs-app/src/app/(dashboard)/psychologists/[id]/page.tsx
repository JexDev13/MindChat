"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { psychologistsService, PsychologistProfile } from "@/lib/api/clinical.service";
import { usersService, UserInfo } from "@/lib/api/users.service";
import { sessionRequestsService, chatsService } from "@/lib/api/chat-rest.service";
import { useAuthStore } from "@/lib/store/auth.store";
import { GlassCard } from "@/components/shared/GlassCard";
import { GradientButton } from "@/components/ui/gradient-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Loader2, GraduationCap, Award, Users, Calendar, MessageSquare, Clock, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { ContactPsychologistDialog } from "@/components/psychologists/ContactPsychologistDialog";
import { ScheduleAppointmentDialog } from "@/components/appointments/ScheduleAppointmentDialog";

interface RequestStatus {
  hasRequest: boolean;
  status: 'Pending' | 'Accepted' | 'Rejected' | null;
  sessionRequestId: string | null;
  chatId: string | null;
}

export default function PsychologistProfilePage() {
  const params = useParams();
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const profileId = params.id as string;

  const [psychologist, setPsychologist] = useState<PsychologistProfile | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestStatus, setRequestStatus] = useState<RequestStatus>({
    hasRequest: false,
    status: null,
    sessionRequestId: null,
    chatId: null
  });
  const [connecting, setConnecting] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  const fetchRequestStatus = async () => {
    if (!user?.profileId) return;
    
    try {
      const requests = await sessionRequestsService.getByPatient(user.profileId);
      const existingRequest = requests.find(
        req => req.assignedPsychologistId === profileId
      );
      
      if (existingRequest) {
        let chatId: string | null = null;
        
        // Try to get existing chat
        try {
          const chat = await chatsService.getBySessionRequest(existingRequest.id);
          chatId = chat.id;
        } catch {
          // No chat exists yet
        }
        
        setRequestStatus({
          hasRequest: true,
          status: existingRequest.status,
          sessionRequestId: existingRequest.id,
          chatId
        });
      } else {
        setRequestStatus({
          hasRequest: false,
          status: null,
          sessionRequestId: null,
          chatId: null
        });
      }
    } catch (error) {
      console.error('Failed to check session requests:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch psychologist profile
        const profile = await psychologistsService.getById(profileId);
        setPsychologist(profile);

        // Fetch user info (name, photo)
        try {
          const info = await usersService.getById(profile.userId);
          setUserInfo(info);
        } catch (error) {
          console.error('Failed to fetch user info:', error);
        }

        // Check if patient has active request
        await fetchRequestStatus();
      } catch (error) {
        console.error('Failed to fetch psychologist:', error);
        toast.error('Failed to load psychologist profile');
      } finally {
        setLoading(false);
      }
    };

    if (profileId) {
      fetchData();
    }
  }, [profileId, user?.profileId]);

  const handleGoToChat = () => {
    if (requestStatus.chatId) {
      router.push(`/chat/${requestStatus.chatId}`);
    } else {
      router.push('/chat');
    }
  };

  const handleConnect = async () => {
    if (!user?.profileId) {
      toast.error('Please log in to connect');
      return;
    }

    setConnecting(true);
    try {
      let sessionRequestId = requestStatus.sessionRequestId;

      let status: RequestStatus['status'] = requestStatus.status;

      if (!sessionRequestId || requestStatus.status === 'Rejected') {
        const sessionRequest = await sessionRequestsService.create({
          patientId: user.profileId,
          initialMessage: "Hello! I'd like to connect and start a session."
        });

        await sessionRequestsService.assignPsychologist(sessionRequest.id, {
          psychologistId: profileId
        });

        sessionRequestId = sessionRequest.id;
        status = sessionRequest.status;
      }

      let chatId = requestStatus.chatId;
      if (!chatId && sessionRequestId) {
        try {
          const chat = await chatsService.getBySessionRequest(sessionRequestId);
          chatId = chat.id;
        } catch {
          // Chat not created yet (awaiting acceptance)
        }
      }

      setRequestStatus((prev) => ({
        ...prev,
        hasRequest: true,
        sessionRequestId,
        chatId: chatId || null,
        status: status || 'Pending'
      }));

      if (!requestStatus.hasRequest) {
        fetchRequestStatus();
      }

      toast.success('Request sent', {
        description: 'You will be able to chat once the psychologist accepts.'
      });
    } catch (error) {
      console.error('Failed to connect:', error);
      toast.error('Failed to connect', {
        description: 'Please try again later'
      });
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!psychologist) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-muted-foreground">Psychologist not found</p>
        <GradientButton onClick={() => router.back()}>Go Back</GradientButton>
      </div>
    );
  }

  const displayName = userInfo?.fullName || 'Licensed Professional';
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'PS';
  const profilePicture = userInfo?.profilePictureUrl;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-muted-foreground hover:text-white transition-colors"
      >
        <ArrowLeft size={20} />
        <span>Back</span>
      </button>

      {/* Profile Header */}
      <GlassCard className="p-8">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <Avatar className="h-32 w-32 border-4 border-purple-500/30">
            {profilePicture ? (
              <AvatarImage src={profilePicture} alt={displayName} />
            ) : null}
            <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-3xl">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
            
            <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
              {psychologist.isVerified && (
                <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                  <Award size={14} /> Verified
                </span>
              )}
              {psychologist.professionalLicense && (
                <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm">
                  License: {psychologist.professionalLicense}
                </span>
              )}
            </div>

            {psychologist.bio && (
              <p className="text-muted-foreground mb-4">{psychologist.bio}</p>
            )}

            <div className="flex flex-wrap gap-4 justify-center md:justify-start">
              <div className="flex items-center gap-3 flex-wrap">
                {requestStatus.status === 'Pending' && (
                  <span className="bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-full text-sm flex items-center gap-2">
                    <Clock size={14} /> Chat Request Pending
                  </span>
                )}
                {requestStatus.status === 'Accepted' && (
                  <span className="bg-green-500/20 text-green-400 px-4 py-2 rounded-full text-sm flex items-center gap-2">
                    <CheckCircle size={14} /> Connected
                  </span>
                )}
                {requestStatus.status === 'Rejected' && (
                  <span className="bg-red-500/20 text-red-400 px-4 py-2 rounded-full text-sm">
                    Request Declined
                  </span>
                )}

                {/* Schedule Appointment - Primary Action */}
                <GradientButton 
                  onClick={() => setShowScheduleDialog(true)}
                >
                  <Calendar size={16} className="mr-2" />
                  Schedule Appointment
                </GradientButton>

                {/* Chat Button - Opens dialog if not connected, goes to chat if connected */}
                {requestStatus.chatId ? (
                  <button 
                    onClick={handleGoToChat}
                    className="px-4 py-2 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 transition-colors text-sm flex items-center gap-2 text-purple-300"
                  >
                    <MessageSquare size={14} /> Open Chat
                  </button>
                ) : requestStatus.status === 'Pending' ? (
                  <button 
                    disabled
                    className="px-4 py-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 text-sm flex items-center gap-2 cursor-not-allowed opacity-70"
                  >
                    <Clock size={14} /> Chat Pending
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowContactDialog(true)}
                    className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 transition-colors text-sm flex items-center gap-2"
                  >
                    <MessageSquare size={14} /> Connect for Chat
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Details Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Education */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <GraduationCap className="text-purple-500" /> Education
          </h3>
          <div className="space-y-2">
            {psychologist.university && (
              <p><span className="text-muted-foreground">University:</span> {psychologist.university}</p>
            )}
            {psychologist.graduationDate && (
              <p>
                <span className="text-muted-foreground">Graduated:</span>{' '}
                {new Date(psychologist.graduationDate).getFullYear()}
              </p>
            )}
          </div>
        </GlassCard>

        {/* Specializations */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Users className="text-blue-500" /> Specializations
          </h3>
          {psychologist.tags && psychologist.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {psychologist.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No specializations listed</p>
          )}
        </GlassCard>
      </div>

      {/* Contact Psychologist Dialog - For starting a chat connection */}
      {user?.profileId && (
        <ContactPsychologistDialog
          open={showContactDialog}
          onOpenChange={setShowContactDialog}
          patientId={user.profileId}
          psychologistId={profileId}
          psychologistName={displayName}
          onSuccess={() => {
            fetchRequestStatus();
            setShowContactDialog(false);
          }}
        />
      )}

      {/* Schedule Appointment Dialog - For booking appointments */}
      {user?.profileId && (
        <ScheduleAppointmentDialog
          open={showScheduleDialog}
          onOpenChange={setShowScheduleDialog}
          patientId={user.profileId}
          psychologistId={profileId}
          psychologistName={displayName}
          pendingApproval={true}
          onSuccess={() => {
            setShowScheduleDialog(false);
            toast.success('Appointment request sent!', {
              description: `${displayName} will review your request.`
            });
          }}
        />
      )}
    </div>
  );
}
