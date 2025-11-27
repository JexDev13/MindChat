"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { format, parseISO } from "date-fns";

interface Appointment {
 id: number;
 patientName: string;
 scheduledAt: string;
 notes: string;
 scheduledAtFormatted?: string;
}

export default function AppointmentsPage() {
 const [items, setItems] = useState<Appointment[]>([]);
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);

 async function load() {
 setLoading(true);
 setError(null);
 try {
 const res = await axios.get("/backend/Appointment/Search", { withCredentials: true });
 const data = res.data;
 if (data.success) setItems(data.appointments);
 } catch (e) {
 setError("No se pudieron cargar las citas");
 } finally { setLoading(false); }
 }

 useEffect(() => { load(); }, []);

 return (
 <main className="p-6">
 <h1 className="text-2xl font-semibold mb-4">Citas</h1>
 {loading && <p className="text-zinc-400">Cargando...</p>}
 {error && <p className="text-red-400">{error}</p>}
 <div className="space-y-3">
 {items.map(a => (
 <div key={a.id} className="glass p-4">
 <div className="font-medium">{a.patientName}</div>
 <div className="text-sm text-zinc-400">{format(parseISO(a.scheduledAt), 'dd/MM/yyyy HH:mm')}</div>
 <div className="text-sm text-zinc-300">{a.notes}</div>
 </div>
 ))}
 </div>
 </main>
 );
}
