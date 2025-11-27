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
 if (!connection || !input.trim()) return;
 await connection.invoke("SendMessage", chatId, input.trim(), "Tu");
 setInput("");
 }

 return (
 <main className="p-6 max-w-4xl mx-auto">
 <h1 className="text-2xl font-semibold mb-4">Chat</h1>
 <div className="space-y-2 mb-4">
 {messages.map((m, i) => (
 <div key={i} className="text-sm text-zinc-200">{m}</div>
 ))}
 </div>
 <div className="flex items-center gap-2">
 <div className="flex-1 relative">
 <input
 className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 pr-12 text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-600"
 value={input}
 onChange={(e) => setInput(e.target.value)}
 placeholder="Escribe un mensaje..."
 onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); send(); } }}
 />
 <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-zinc-400 text-xs">Enter</div>
 </div>
 <button onClick={send} className="bg-gradient-to-r from-brand-600 to-sky-600 hover:from-brand-500 hover:to-sky-500 rounded-lg px-4 py-2">Enviar</button>
 </div>
 </main>
 );
}
