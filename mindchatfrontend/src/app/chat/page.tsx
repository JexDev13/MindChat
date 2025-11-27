"use client";
import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";

export default function ChatPage() {
 const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
 const [messages, setMessages] = useState<string[]>([]);
 const [input, setInput] = useState("");
 const [chatId] = useState<number>(1); // TODO: read from params

 useEffect(() => {
 const conn = new signalR.HubConnectionBuilder()
 .withUrl("/chathub")
 .withAutomaticReconnect()
 .build();

 conn.on("ReceiveMessage", (_chatId: number, text: string, sender: string, time: string) => {
 setMessages(prev => [...prev, `${sender} [${time}]: ${text}`]);
 });

 conn.start()
 .then(() => conn.invoke("JoinChat", chatId))
 .catch(console.error);

 setConnection(conn);
 return () => { conn.stop(); };
 }, [chatId]);

 async function send() {
 if (!connection || !input) return;
 await connection.invoke("SendMessage", chatId, input, "Tú");
 setInput("");
 }

 return (
 <main className="p-6">
 <h1 className="text-2xl font-semibold mb-4">Chat</h1>
 <div className="space-y-2 mb-4">
 {messages.map((m, i) => (
 <div key={i} className="text-sm text-zinc-200">{m}</div>
 ))}
 </div>
 <div className="flex gap-2">
 <input className="flex-1 rounded bg-zinc-900 border border-zinc-700 px-3 py-2" value={input} onChange={e => setInput(e.target.value)} />
 <button onClick={send} className="bg-brand-600 px-4 rounded">Enviar</button>
 </div>
 </main>
 );
}
