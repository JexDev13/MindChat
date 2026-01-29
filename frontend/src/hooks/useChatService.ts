"use client";

import { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatService } from "@/services";
import { useAuth } from "@/store";
import {
  Chat,
  ChatDetail,
  SessionRequest,
  CreateSessionRequestRequest,
} from "@/types";

export function useChatService() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Get all chats for current user
  const {
    data: chats = [],
    isLoading: isLoadingChats,
    refetch: refetchChats,
  } = useQuery({
    queryKey: ["chats", user?.id],
    queryFn: () => chatService.getChatsByUser(user?.id || ""),
    enabled: !!user?.id,
  });

  // Get chat by ID
  const getChatById = useCallback(
    async (chatId: string): Promise<ChatDetail | null> => {
      try {
        return await chatService.getChatById(chatId);
      } catch {
        return null;
      }
    },
    []
  );

  // Create session request
  const createSessionRequest = useMutation({
    mutationFn: (data: CreateSessionRequestRequest) =>
      chatService.createSessionRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-requests"] });
    },
  });

  // Accept session request
  const acceptSessionRequest = useMutation({
    mutationFn: async (requestId: string) => {
      await chatService.updateSessionStatus(requestId, { status: "Accepted" });
      const chat = await chatService.createChat(requestId);
      return chat;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-requests"] });
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  // Reject session request
  const rejectSessionRequest = useMutation({
    mutationFn: (requestId: string) =>
      chatService.updateSessionStatus(requestId, { status: "Rejected" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-requests"] });
    },
  });

  // Close chat
  const closeChat = useMutation({
    mutationFn: chatService.closeChat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
    },
  });

  return {
    chats,
    isLoadingChats,
    refetchChats,
    getChatById,
    createSessionRequest,
    acceptSessionRequest,
    rejectSessionRequest,
    closeChat,
  };
}

export default useChatService;
