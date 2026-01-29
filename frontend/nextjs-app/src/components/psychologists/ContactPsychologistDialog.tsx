"use client";

import { useState } from "react";
import { Loader2, MessageSquare, Send } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GradientButton } from "@/components/ui/gradient-button";
import { sessionRequestsService } from "@/lib/api/chat-rest.service";
import { toast } from "sonner";

interface ContactPsychologistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  psychologistId: string;
  psychologistName: string;
  onSuccess?: () => void;
}

export function ContactPsychologistDialog({
  open,
  onOpenChange,
  patientId,
  psychologistId,
  psychologistName,
  onSuccess
}: ContactPsychologistDialogProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendRequest = async () => {
    if (!message.trim()) {
      toast.error("Please write a message");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Create session request with message
      const sessionRequest = await sessionRequestsService.create({
        patientId,
        initialMessage: message.trim()
      });
      
      console.log('[ContactDialog] Created session request:', sessionRequest.id);
      
      // Step 2: Assign psychologist
      await sessionRequestsService.assignPsychologist(sessionRequest.id, {
        psychologistId
      });
      
      console.log('[ContactDialog] Assigned psychologist:', psychologistId);
      
      toast.success('Request sent!', {
        description: `${psychologistName} will review your request soon.`
      });

      onOpenChange(false);
      onSuccess?.();
      
      setMessage("");
    } catch (error) {
      console.error('[ContactDialog] Failed to send request:', error);
      toast.error('Failed to send message', {
        description: 'Please try again later'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setMessage("");
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md bg-black/95 border-white/10">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="text-purple-500" />
            Contact {psychologistName}
          </DialogTitle>
          <DialogDescription>
            Send a message to introduce yourself and explain why you&apos;d like to work with this psychologist.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <label className="text-sm font-medium mb-2 block">Your message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Hello, I'm looking for help with... (describe your situation or what you'd like to discuss)"
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-sm resize-none h-32 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-muted-foreground"
            autoFocus
          />
          <p className="text-xs text-muted-foreground mt-2">
            The psychologist will review your message. You&apos;ll be able to chat once they accept your request.
          </p>
        </div>

        <DialogFooter>
          <button
            onClick={handleClose}
            className="px-4 py-2 text-sm rounded-lg border border-white/10 hover:bg-white/5"
          >
            Cancel
          </button>
          <GradientButton onClick={handleSendRequest} disabled={loading || !message.trim()}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Send size={16} className="mr-2" />
            )}
            Send Message
          </GradientButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
