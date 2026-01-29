'use client';

import { PsychologistProfile } from '@/lib/api/psychologists.api';
import { GlassCard } from '@/components/shared/GlassCard';
import { Badge } from '@/components/ui/badge';
import { ScheduleAppointmentButton } from '@/components/appointments/ScheduleAppointmentButton';
import { GradientButton } from '@/components/ui/gradient-button';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuthStore } from '@/lib/store/auth.store';
import { toast } from 'sonner';
import { sessionRequestsApi } from '@/lib/api/session-requests.api';

interface PsychologistCardProps {
  psychologist: PsychologistProfile;
}

export function PsychologistCard({ psychologist }: PsychologistCardProps) {
  const [requestOpen, setRequestOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const user = useAuthStore(state => state.user);

  const displayName = psychologist.name || (psychologist.firstName ? `${psychologist.firstName} ${psychologist.lastName}` : 'Psychologist');

  const handleRequestSession = async () => {
     if (!user?.profileId) {
       toast.error('User profile not found');
       return;
     }

     setLoading(true);
     try {
       // Since the backend API for session request creation takes patientId
       // We must ensure we send it.
       // The instruction says:
       // Body: { "patientId": "patient.profileId", "initialMessage": "..." }
       // But wait, "assignedPsychologistId" is not in the CreateSessionRequestRequest interface in my API?
       // Let me check session-requests.api.ts again.

       /*
       export interface CreateSessionRequestRequest {
          patientId: string;
          initialMessage: string;
       }
       */

       // If I can't specify psychologistId in creation, how does the system know which psychologist?
       // The instruction says:
       // 3. Patient Selects Psychologist & Creates Session Request
       // Body: { "patientId": "patient.profileId", "initialMessage": "..." }
       // And Backend creates SessionRequest with status="Pending"

       // And then:
       // Journey 2: Psychologist Responding to Requests
       // 3. Psychologist Accepts Request
       // Step 1: Assign themselves

       // Ah! So the request is OPEN to ANY psychologist initially?
       // "Psychologist Views Pending Requests ... Chat Service returns all unassigned requests"

       // Okay, so the patient requests a session, and ANY psychologist can pick it up.
       // That explains why CreateSessionRequestRequest doesn't have psychologistId.

       await sessionRequestsApi.create({
         patientId: user.profileId,
         initialMessage: message
       });

       toast.success('Session request sent successfully! A psychologist will pick it up soon.');
       setRequestOpen(false);
       setMessage('');
     } catch (error: any) {
       console.error('Failed to send request:', error);
       toast.error(error.response?.data?.message || 'Failed to send session request');
     } finally {
       setLoading(false);
     }
  };

  return (
    <GlassCard className="flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-xl font-bold">{displayName}</h3>
        <p className="text-sm text-muted-foreground">{psychologist.university}</p>
      </div>

      <p className="text-sm text-zinc-300 mb-4 flex-grow line-clamp-3">
        {psychologist.bio || 'No biography available.'}
      </p>

      <div className="flex gap-2 flex-wrap mb-6">
        {psychologist.tags?.map(tag => (
          <Badge key={tag} variant="secondary" className="bg-white/10 hover:bg-white/20">
            {tag}
          </Badge>
        ))}
      </div>

      <div className="space-y-3 mt-auto">
        {/* Schedule Appointment Button - Specific to this psychologist */}
        <ScheduleAppointmentButton
          psychologistId={psychologist.profileId}
          psychologistName={displayName}
        />

        {/* Request Session Button - Seemingly global based on API?
            But here we are on a specific psychologist card.
            If I click this, does it notify THIS psychologist?
            Based on the API "CreateSessionRequestRequest" only having patientId, it seems it's a general pool.

            However, the UI is "Psychologist Card". It's confusing if I click "Request Session" on Dr. Smith
            but Dr. Jones picks it up.

            But wait, the instruction says:
            "Psychologist Views Pending Requests ... Chat Service returns all unassigned requests"

            So yes, it seems it is a pool.

            BUT, usually you want to request a specific one.
            Maybe the instruction implies the simple flow first.

            I will implement as is. The user clicks "Request Session" on a card, but it goes to the pool.
            Maybe I should clarify in the UI "Request General Support"?

            Actually, let's look at `frontend/nextjs-app/src/lib/api/session-requests.api.ts` again.
            Maybe I missed something.
        */

       /*
       Journey 1: Patient Seeking Help
       ...
       3. Patient Selects Psychologist & Creates Session Request
          ├── Patient clicks "Request Session" button
          ├── Modal opens with message input
          ├── Frontend calls: POST /api/session-requests
       */

       /*
       If I strictly follow the API defined in instruction, it does NOT have psychologistId in creation.
       So it creates a pending request in the pool.

       However, if the "Patient Selects Psychologist" step implies targeting, the backend might be missing that field or I missed it.

       But I must follow the instructions.
       */

        }
        <button
          onClick={() => setRequestOpen(true)}
          className="w-full py-2 text-sm border border-white/10 rounded-lg hover:bg-white/5 transition-colors"
        >
          Request Chat Session
        </button>
      </div>

      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent className="backdrop-blur-xl bg-black/90 border border-white/20 text-white">
          <DialogHeader>
            <DialogTitle>Request Session</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Send a message to start a chat session. A psychologist will review your request and accept it.
            </p>

            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I would like to discuss..."
              className="w-full px-4 py-2 rounded-lg backdrop-blur-xl bg-white/10 border border-white/20 text-white min-h-[100px]"
              rows={4}
            />

            <GradientButton
              onClick={handleRequestSession}
              disabled={loading || !message.trim()}
              className="w-full"
            >
              {loading ? "Sending..." : "Send Request"}
            </GradientButton>
          </div>
        </DialogContent>
      </Dialog>
    </GlassCard>
  );
}
