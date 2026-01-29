"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  ReactNode,
} from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from "@microsoft/signalr";
import { useAuth } from "./AuthProvider";
import { SignalRMessage, ChatMessage } from "@/types";

interface ChatContextType {
  connection: HubConnection | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  currentChatId: string | null;
  messages: ChatMessage[];
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  joinChat: (chatId: string) => Promise<void>;
  leaveChat: (chatId: string) => Promise<void>;
  sendMessage: (chatId: string, message: string) => Promise<void>;
  addMessage: (message: ChatMessage) => void;
  setMessages: (messages: ChatMessage[]) => void;
  clearMessages: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const SIGNALR_HUB_URL =
  process.env.NEXT_PUBLIC_SIGNALR_HUB_URL || "http://localhost:8080/chathub";

export function ChatProvider({ children }: { children: ReactNode }) {
  const { token, user, isAuthenticated } = useAuth();
  const [connection, setConnection] = useState<HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const connectionRef = useRef<HubConnection | null>(null);

  // Build connection when authenticated (but don't start it automatically)
  useEffect(() => {
    if (!isAuthenticated || !token) {
      // Cleanup if not authenticated
      if (connectionRef.current) {
        connectionRef.current.stop().catch(() => {});
        connectionRef.current = null;
        setConnection(null);
        setIsConnected(false);
      }
      return;
    }

    // Only build if we don't have a connection yet
    if (connectionRef.current) return;

    const newConnection = new HubConnectionBuilder()
      .withUrl(SIGNALR_HUB_URL, {
        accessTokenFactory: () => token,
        withCredentials: false, // Avoid CORS issues with credentials
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
      .configureLogging(LogLevel.Warning) // Reduce noise
      .build();

    connectionRef.current = newConnection;
    setConnection(newConnection);

    // Handle incoming messages
    newConnection.on("ReceiveMessage", (data: SignalRMessage) => {
      const newMessage: ChatMessage = {
        id: data.id,
        chatId: data.chatId,
        senderUserId: data.senderUserId,
        message: data.message,
        sentAt: data.sentAt,
        isOwnMessage: data.senderUserId === user?.id,
      };

      setMessages((prev) => [...prev, newMessage]);
    });

    // Handle errors
    newConnection.on("Error", (error: string) => {
      console.error("SignalR Error: ", error);
      setConnectionError(error);
    });

    // Handle reconnection events
    newConnection.onreconnecting(() => {
      setIsConnected(false);
      setIsConnecting(true);
    });

    newConnection.onreconnected(() => {
      setIsConnected(true);
      setIsConnecting(false);
      setConnectionError(null);
      // Rejoin current chat if any
      if (currentChatId) {
        newConnection.invoke("JoinChat", currentChatId).catch(() => {});
      }
    });

    newConnection.onclose(() => {
      setIsConnected(false);
      setIsConnecting(false);
    });

    // Cleanup on unmount
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop().catch(() => {});
      }
    };
  }, [isAuthenticated, token, user?.id, currentChatId]);

  // Manual connect function - call this when entering chat page
  const connect = useCallback(async () => {
    if (!connectionRef.current) return;
    if (connectionRef.current.state === HubConnectionState.Connected) return;
    if (isConnecting) return;

    setIsConnecting(true);
    setConnectionError(null);

    try {
      await connectionRef.current.start();
      setIsConnected(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Connection failed";
      setConnectionError(errorMessage);
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting]);

  // Manual disconnect function
  const disconnect = useCallback(async () => {
    if (!connectionRef.current) return;
    if (connectionRef.current.state !== HubConnectionState.Connected) return;

    try {
      await connectionRef.current.stop();
      setIsConnected(false);
      setCurrentChatId(null);
      setMessages([]);
    } catch (err) {
      console.error("Error disconnecting:", err);
    }
  }, []);

  const joinChat = useCallback(
    async (chatId: string) => {
      if (
        connection?.state === HubConnectionState.Connected &&
        chatId !== currentChatId
      ) {
        try {
          // Leave current chat first
          if (currentChatId) {
            await connection.invoke("LeaveChat", currentChatId);
          }
          await connection.invoke("JoinChat", chatId);
          setCurrentChatId(chatId);
          setMessages([]); // Clear messages when joining new chat
        } catch (err) {
          console.error("Error joining chat: ", err);
        }
      }
    },
    [connection, currentChatId]
  );

  const leaveChat = useCallback(
    async (chatId: string) => {
      if (connection?.state === HubConnectionState.Connected) {
        try {
          await connection.invoke("LeaveChat", chatId);
          if (currentChatId === chatId) {
            setCurrentChatId(null);
            setMessages([]);
          }
        } catch (err) {
          console.error("Error leaving chat: ", err);
        }
      }
    },
    [connection, currentChatId]
  );

  const sendMessage = useCallback(
    async (chatId: string, message: string) => {
      if (connection?.state === HubConnectionState.Connected) {
        try {
          await connection.invoke("SendMessage", chatId, message);
        } catch (err) {
          console.error("Error sending message: ", err);
          throw err;
        }
      }
    },
    [connection]
  );

  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <ChatContext.Provider
      value={{
        connection,
        isConnected,
        isConnecting,
        connectionError,
        currentChatId,
        messages,
        connect,
        disconnect,
        joinChat,
        leaveChat,
        sendMessage,
        addMessage,
        setMessages,
        clearMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}

export default ChatContext;
