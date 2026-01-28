import { HubConnection, HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

class ChatService {
  private connection: HubConnection | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private callbacks: Record<string, ((...args: any[]) => void)[]> = {};

  public async connect(token: string) {
    if (this.connection) return;

    this.connection = new HubConnectionBuilder()
      .withUrl(process.env.NEXT_PUBLIC_CHAT_HUB_URL || "http://localhost:5003/chatHub", {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    // Eventos del servidor
    this.connection.on("ReceiveMessage", (chatId, senderUserId, message, sentAt) => {
      this.emit("ReceiveMessage", { chatId, senderUserId, message, sentAt });
    });

    this.connection.on("UserJoined", (chatId, userId, userName) => {
      this.emit("UserJoined", { chatId, userId, userName });
    });

    this.connection.on("UserLeft", (chatId, userId, userName) => {
      this.emit("UserLeft", { chatId, userId, userName });
    });

    this.connection.on("UserTyping", (chatId, userId, userName) => {
      this.emit("UserTyping", { chatId, userId, userName });
    });

    this.connection.on("UserStoppedTyping", (chatId, userId, userName) => {
      this.emit("UserStoppedTyping", { chatId, userId, userName });
    });

    this.connection.on("ChatHistory", (messages) => {
      this.emit("ChatHistory", messages);
    });

    this.connection.on("ChatClosed", (chatId) => {
      this.emit("ChatClosed", chatId);
    });

    try {
      await this.connection.start();
      console.log("✅ SignalR Connected");
    } catch (err) {
      console.error("❌ SignalR Connection Error: ", err);
    }
  }

  public async disconnect() {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  // Métodos para invocar en el servidor
  public async joinChat(chatId: string) {
    if (this.connection) {
      await this.connection.invoke("JoinChat", chatId);
    }
  }

  public async leaveChat(chatId: string) {
    if (this.connection) {
      await this.connection.invoke("LeaveChat", chatId);
    }
  }

  public async sendMessage(chatId: string, message: string) {
    if (this.connection) {
      await this.connection.invoke("SendMessage", chatId, message);
    }
  }

  public async typing(chatId: string) {
    if (this.connection) {
      await this.connection.invoke("Typing", chatId);
    }
  }

  public async stopTyping(chatId: string) {
    if (this.connection) {
      await this.connection.invoke("StopTyping", chatId);
    }
  }

  public async closeChat(chatId: string) {
    if (this.connection) {
      await this.connection.invoke("CloseChat", chatId);
    }
  }

  // Método para saber si está conectado
  public isConnected(): boolean {
    return this.connection?.state === "Connected";
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public on(event: string, callback: (...args: any[]) => void) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public off(event: string, callback: (...args: any[]) => void) {
    if (!this.callbacks[event]) return;
    this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private emit(event: string, ...args: any[]) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(cb => cb(...args));
    }
  }
}

export const chatService = new ChatService();
