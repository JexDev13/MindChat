"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function ForgotPage() {
 const [email, setEmail] = useState("");
 const [msg, setMsg] = useState<string | null>(null);
 const [err, setErr] = useState<string | null>(null);
 const [antiForgeryToken, setAntiForgeryToken] = useState<string | null>(null);

 async function loadToken() {
 try {
 const res = await fetch("/backend/api/antiforgery", { credentials: "include" });
 const data = await res.json();
 setAntiForgeryToken(data.token || null);
 } catch { setAntiForgeryToken(null); }
 }

 useEffect(() => { loadToken(); }, []);

 async function submit(e: React.FormEvent) {
 e.preventDefault();
 setErr(null); setMsg(null);
 if (!antiForgeryToken) { setErr("No se pudo obtener el token de seguridad."); return; }
 try {
 const body = new URLSearchParams();
 body.set("Email", email);
 body.set("__RequestVerificationToken", antiForgeryToken);
 const resp = await axios.post("/backend/Auth/ForgotPassword", body, {
 headers: { "Content-Type": "application/x-www-form-urlencoded", "X-XSRF-TOKEN": antiForgeryToken },
 withCredentials: true,
 maxRedirects:0,
 validateStatus: s => s >=200 && s <400,
 });
 setMsg("Si el correo existe, se enviara un enlace.");
 } catch {
 setErr("No se pudo procesar la solicitud.");
 }
 }

 return (
 <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b0b19] via-[#120e27] to-[#0a1235] p-6">
 <div className="w-full max-w-md glass p-8 border border-white/10 bg-white/5">
 <h1 className="text-2xl font-semibold mb-6">Recuperar contrasena</h1>
 <form onSubmit={submit} className="space-y-4">
 <div>
 <label className="block text-sm text-zinc-300">Email</label>
 <input type="email" value={email} onChange={e=>setEmail(e.target.value)} className="w-full mt-1 bg-black/40 border border-white/10 rounded px-3 py-2" required />
 </div>
 {err && <p className="text-sm text-red-400">{err}</p>}
 {msg && <p className="text-sm text-green-400">{msg}</p>}
 <button className="w-full bg-gradient-to-r from-brand-600 to-sky-600 hover:from-brand-500 hover:to-sky-500 rounded py-2 font-medium">Enviar enlace</button>
 </form>
 <div className="text-right mt-3 text-sm">
 <a className="text-brand-300 hover:text-brand-200" href="/login">Volver al inicio de sesion</a>
 </div>
 </div>
 </main>
 );
}
