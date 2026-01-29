"use client";

import { useState, useEffect } from "react";
import { Bell, Calendar, MessageSquare, UserCheck, Clock, X, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/store/auth.store";
import { sessionRequestsService, SessionRequest, chatsService } from "@/lib/api/chat-rest.service";
import { appointmentsService, Appointment } from "@/lib/api/appointments.service";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: 'session_request' | 'appointment_request' | 'chat_accepted' | 'appointment_reminder';
  title: string;
  description: string;
  time: Date;
  read: boolean;
  actionData?: {
    sessionRequestId?: string;
    appointmentId?: string;
    chatId?: string;
    patientName?: string;
    psychologistName?: string;
  };
}

export function NotificationDropdown() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!user?.profileId || !user?.userType) return;
    
    setLoading(true);
    const notifs: Notification[] = [];

    try {
      if (user.userType === 'psychologist') {
        // Fetch pending session requests for psychologist
        const sessionRequests = await sessionRequestsService.getByPsychologist(user.profileId);
        const pendingRequests = sessionRequests.filter(sr => sr.status === 'Pending');
        
        pendingRequests.forEach(sr => {
          notifs.push({
            id: `sr-${sr.id}`,
            type: 'session_request',
            title: 'New Connection Request',
            description: sr.initialMessage?.substring(0, 50) + (sr.initialMessage && sr.initialMessage.length > 50 ? '...' : '') || 'A patient wants to connect',
            time: new Date(sr.createdAt),
            read: false,
            actionData: {
              sessionRequestId: sr.id,
              patientName: 'Patient'
            }
          });
        });

        // Fetch pending appointments for psychologist
        const appointments = await appointmentsService.getByPsychologist(user.profileId);
        const pendingAppointments = appointments.filter(a => 
          !a.isCancelled && a.notes?.startsWith('[PENDING_APPROVAL]')
        );

        pendingAppointments.forEach(appt => {
          notifs.push({
            id: `appt-${appt.id}`,
            type: 'appointment_request',
            title: 'New Appointment Request',
            description: `Requested for ${new Date(appt.scheduledAt).toLocaleDateString()} at ${new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            time: new Date(appt.scheduledAt),
            read: false,
            actionData: {
              appointmentId: appt.id
            }
          });
        });
      } else {
        // Patient notifications
        const sessionRequests = await sessionRequestsService.getByPatient(user.profileId);
        
        // Recently accepted requests (within last 24 hours)
        const recentlyAccepted = sessionRequests.filter(sr => {
          if (sr.status !== 'Accepted') return false;
          const createdDate = new Date(sr.createdAt);
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
          return createdDate > oneDayAgo;
        });

        for (const sr of recentlyAccepted) {
          try {
            const chat = await chatsService.getBySessionRequest(sr.id);
            notifs.push({
              id: `accepted-${sr.id}`,
              type: 'chat_accepted',
              title: 'Request Accepted!',
              description: 'Your psychologist has accepted your request. You can now chat.',
              time: new Date(sr.createdAt),
              read: false,
              actionData: {
                sessionRequestId: sr.id,
                chatId: chat.id
              }
            });
          } catch {
            // Chat not created yet
          }
        }

        // Upcoming appointments in next 24 hours
        const appointments = await appointmentsService.getByPatient(user.profileId);
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        const upcomingAppointments = appointments.filter(a => {
          const apptDate = new Date(a.scheduledAt);
          return !a.isCancelled && apptDate > now && apptDate < tomorrow;
        });

        upcomingAppointments.forEach(appt => {
          notifs.push({
            id: `reminder-${appt.id}`,
            type: 'appointment_reminder',
            title: 'Upcoming Appointment',
            description: `Today at ${new Date(appt.scheduledAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            time: new Date(appt.scheduledAt),
            read: false,
            actionData: {
              appointmentId: appt.id
            }
          });
        });
      }

      // Sort by time, most recent first
      notifs.sort((a, b) => b.time.getTime() - a.time.getTime());
      setNotifications(notifs);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user?.profileId, user?.userType]);

  const handleAcceptSessionRequest = async (sessionRequestId: string) => {
    try {
      await sessionRequestsService.updateStatus(sessionRequestId, { status: 'Accepted' });
      const chat = await chatsService.create({ sessionRequestId });
      
      toast.success('Request accepted!', {
        description: 'Chat has been created.',
        action: {
          label: 'Open Chat',
          onClick: () => router.push(`/chat/${chat.id}`)
        }
      });
      
      fetchNotifications();
    } catch (error) {
      console.error('Failed to accept request:', error);
      toast.error('Failed to accept request');
    }
  };

  const handleDeclineSessionRequest = async (sessionRequestId: string) => {
    try {
      await sessionRequestsService.updateStatus(sessionRequestId, { status: 'Rejected' });
      toast.success('Request declined');
      fetchNotifications();
    } catch (error) {
      console.error('Failed to decline request:', error);
      toast.error('Failed to decline request');
    }
  };

  const handleAcceptAppointment = async (appointmentId: string) => {
    try {
      const appointment = await appointmentsService.getById(appointmentId);
      // Remove the pending prefix
      const cleanNotes = appointment.notes?.replace('[PENDING_APPROVAL]', '').trim() || '';
      await appointmentsService.update(appointmentId, { notes: cleanNotes });
      
      toast.success('Appointment confirmed!');
      fetchNotifications();
    } catch (error) {
      console.error('Failed to accept appointment:', error);
      toast.error('Failed to accept appointment');
    }
  };

  const handleDeclineAppointment = async (appointmentId: string) => {
    try {
      await appointmentsService.cancel(appointmentId);
      toast.success('Appointment declined');
      fetchNotifications();
    } catch (error) {
      console.error('Failed to decline appointment:', error);
      toast.error('Failed to decline appointment');
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'session_request':
        return <UserCheck className="text-purple-400" size={18} />;
      case 'appointment_request':
        return <Calendar className="text-blue-400" size={18} />;
      case 'chat_accepted':
        return <MessageSquare className="text-green-400" size={18} />;
      case 'appointment_reminder':
        return <Clock className="text-orange-400" size={18} />;
      default:
        return <Bell className="text-gray-400" size={18} />;
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-white/10 rounded-full relative"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 md:w-96 bg-black/95 border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
              <h3 className="font-semibold">Notifications</h3>
              <span className="text-xs text-muted-foreground">{unreadCount} new</span>
            </div>

            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-muted-foreground">
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Bell className="mx-auto mb-2 opacity-50" size={32} />
                  <p>No notifications</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className={cn(
                      "p-4 border-b border-white/5 hover:bg-white/5 transition-colors",
                      !notif.read && "bg-purple-500/5"
                    )}
                  >
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{notif.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{notif.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(notif.time, { addSuffix: true })}
                        </p>

                        {/* Action buttons for psychologist */}
                        {notif.type === 'session_request' && notif.actionData?.sessionRequestId && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleAcceptSessionRequest(notif.actionData!.sessionRequestId!)}
                              className="flex-1 py-1.5 px-3 text-xs bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors flex items-center justify-center gap-1"
                            >
                              <Check size={12} /> Accept
                            </button>
                            <button
                              onClick={() => handleDeclineSessionRequest(notif.actionData!.sessionRequestId!)}
                              className="flex-1 py-1.5 px-3 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1"
                            >
                              <X size={12} /> Decline
                            </button>
                          </div>
                        )}

                        {notif.type === 'appointment_request' && notif.actionData?.appointmentId && (
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => handleAcceptAppointment(notif.actionData!.appointmentId!)}
                              className="flex-1 py-1.5 px-3 text-xs bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors flex items-center justify-center gap-1"
                            >
                              <Check size={12} /> Confirm
                            </button>
                            <button
                              onClick={() => handleDeclineAppointment(notif.actionData!.appointmentId!)}
                              className="flex-1 py-1.5 px-3 text-xs bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center gap-1"
                            >
                              <X size={12} /> Decline
                            </button>
                          </div>
                        )}

                        {/* Action button for patient */}
                        {notif.type === 'chat_accepted' && notif.actionData?.chatId && (
                          <button
                            onClick={() => {
                              router.push(`/chat/${notif.actionData!.chatId}`);
                              setIsOpen(false);
                            }}
                            className="w-full mt-2 py-1.5 px-3 text-xs bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors flex items-center justify-center gap-1"
                          >
                            <MessageSquare size={12} /> Open Chat
                          </button>
                        )}

                        {notif.type === 'appointment_reminder' && (
                          <button
                            onClick={() => {
                              router.push('/appointments');
                              setIsOpen(false);
                            }}
                            className="w-full mt-2 py-1.5 px-3 text-xs bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors flex items-center justify-center gap-1"
                          >
                            <Calendar size={12} /> View Appointments
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-white/10 text-center">
              <button 
                onClick={() => {
                  router.push('/notifications');
                  setIsOpen(false);
                }}
                className="text-xs text-purple-400 hover:text-purple-300"
              >
                View all notifications
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
