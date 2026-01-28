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

    this.connection.on("ReceiveMessage", (message) => {
      this.emit("ReceiveMessage", message);
    });

    this.connection.on("UserTyping", (userId) => {
      this.emit("UserTyping", userId);
    });

    try {
      await this.connection.start();
      console.log("SignalR Connected");
    } catch (err) {
      console.error("SignalR Connection Error: ", err);
    }
  }

  public async disconnect() {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }

  public async sendMessage(conversationId: string, message: string) {
    if (this.connection) {
      await this.connection.invoke("SendMessage", conversationId, message);
    }
  }

  public async sendTyping(conversationId: string) {
    if (this.connection) {
      await this.connection.invoke("Typing", conversationId);
    }
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
