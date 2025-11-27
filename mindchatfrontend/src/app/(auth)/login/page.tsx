
"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function LoginPage() {
 const [username, setUsername] = useState("");
 const [password, setPassword] = useState("");
 const [role, setRole] = useState<"Patient" | "Psychologist">("Patient");
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [antiForgeryToken, setAntiForgeryToken] = useState<string | null>(null);

 // new: fetch token from dedicated endpoint instead of parsing HTML
 async function loadToken() {
 try {
 const res = await fetch("/backend/api/antiforgery", { credentials: "include" });
 const data = await res.json();
 setAntiForgeryToken(data.token || null);
 } catch {
 setAntiForgeryToken(null);
 }
 }

 useEffect(() => { loadToken(); }, []);

 async function onSubmit(e: React.FormEvent) {
 e.preventDefault();
 setError(null);
 if (!antiForgeryToken) { setError("No se pudo obtener el token de seguridad."); return; }
 setLoading(true);
 try {
 const action = role === "Patient" ? "LoginPatient" : "LoginPsychologist";
 const form = new URLSearchParams();
 form.set("username", username);
 form.set("password", password);
 form.set("__RequestVerificationToken", antiForgeryToken);
 const resp = await axios.post(`/backend/Auth/${action}`, form, {
 headers: { "Content-Type": "application/x-www-form-urlencoded", "X-XSRF-TOKEN": antiForgeryToken },
 withCredentials: true,
 maxRedirects:0,
 validateStatus: (s) => s >=200 && s <400,
 });
 if (resp.status ===200) {
 setError("Credenciales invalidas.");
 setLoading(false);
 return;
 }
 window.location.href = "/dashboard";
 } catch {
 setError("No se pudo iniciar sesion. Verifica tus datos.");
 } finally { setLoading(false); }
 }

 return (
 <div className="min-h-screen flex bg-gradient-to-br from-[#0b0b19] via-[#120e27] to-[#0a1235]">
 <div className="hidden md:flex flex-1 relative">
 <div className="absolute inset-0 bg-[url('/login-hero.jpg')] bg-cover bg-center opacity-60" />
 <div className="absolute inset-0 bg-gradient-to-tr from-brand-900/60 via-transparent to-brand-600/30" />
 </div>
 <div className="flex-1 flex items-center justify-center p-6">
 <div className="w-full max-w-md glass p-8 border border-white/10 bg-white/5">
 <h1 className="text-2xl font-semibold mb-6">MindChat</h1>
 <div className="mb-6 text-sm text-zinc-300">Inicia sesion segun tu rol</div>
 {/* Segmented role selector */}
 <div className="mb-6 rounded-xl p-1 bg-gradient-to-r from-brand-700/50 to-sky-600/40 border border-white/10">
 <div className="grid grid-cols-2 gap-1">
 <button type="button" onClick={() => setRole("Patient")} className={`py-2 rounded-lg transition ${role === "Patient" ? "bg-brand-600 text-white shadow" : "bg-black/30 text-zinc-300"}`}>Paciente</button>
 <button type="button" onClick={() => setRole("Psychologist")} className={`py-2 rounded-lg transition ${role === "Psychologist" ? "bg-brand-600 text-white shadow" : "bg-black/30 text-zinc-300"}`}>Psicologo</button>
 </div>
 </div>

 <form onSubmit={onSubmit} className="space-y-4">
 <div>
 <label className="block text-sm text-zinc-300">Usuario</label>
 <input value={username} onChange={(e) => setUsername(e.target.value)} className="w-full mt-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-600" placeholder="tu usuario" required />
 </div>
 <div>
 <label className="block text-sm text-zinc-300">Contrasena</label>
 <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full mt-1 bg-black/40 border border-white/10 rounded px-3 py-2 text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-brand-600" placeholder="tu contrasena" required />
 </div>
 {error && <p className="text-red-400 text-sm">{error}</p>}
 <button disabled={loading || !antiForgeryToken} className="w-full disabled:opacity-60 bg-gradient-to-r from-brand-600 to-sky-600 hover:from-brand-500 hover:to-sky-500 transition-colors rounded py-2 font-medium">
 {loading ? "Ingresando..." : "Ingresar"}
 </button>
 </form>
 <div className="flex items-center justify-between mt-4 text-sm">
 <a href="/forgot" className="text-zinc-400 hover:text-zinc-200">Olvide mi contrasena</a>
 <div className="space-x-3">
 <a href="/register/patient" className="text-brand-300 hover:text-brand-200">Crear cuenta paciente</a>
 <a href="/register/psychologist" className="text-brand-300 hover:text-brand-200">Crear cuenta psicologo</a>
 </div>
 </div>
 </div>
 </div>
 </div>
 );
}
