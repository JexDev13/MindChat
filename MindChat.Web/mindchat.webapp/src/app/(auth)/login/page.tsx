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

 useEffect(() => {
 const controller = new AbortController();
 async function loadToken() {
 try {
 const action = role === "Patient" ? "LoginPatient" : "LoginPsychologist";
 const res = await fetch(`/backend/Auth/${action}`, {
 method: "GET",
 credentials: "include",
 signal: controller.signal,
 });
 const html = await res.text();
 const match = html.match(/name="__RequestVerificationToken"[^>]*value="([^"]+)"/i);
 if (match) setAntiForgeryToken(match[1]);
 } catch {}
 }
 loadToken();
 return () => controller.abort();
 }, [role]);

 async function onSubmit(e: React.FormEvent) {
 e.preventDefault();
 setError(null);
 setLoading(true);
 try {
 const action = role === "Patient" ? "LoginPatient" : "LoginPsychologist";
 const form = new URLSearchParams();
 form.set("username", username);
 form.set("password", password);
 if (antiForgeryToken) form.set("__RequestVerificationToken", antiForgeryToken);

 await axios.post(`/backend/Auth/${action}`, form, {
 headers: { "Content-Type": "application/x-www-form-urlencoded" },
 withCredentials: true,
 maxRedirects:0,
 validateStatus: (s) => s >=200 && s <400,
 });
 window.location.href = "/dashboard";
 } catch {
 setError("Usuario o contraseña inválidos.");
 } finally { setLoading(false); }
 }

 return (
 <div className="min-h-screen flex bg-gradient-to-br from-[#0b0b19] via-[#0f0f2a] to-[#0a1235]">
 <div className="hidden md:flex flex-1 bg-[url('/login-hero.jpg')] bg-cover bg-center" />
 <div className="flex-1 flex items-center justify-center p-6">
 <div className="w-full max-w-md glass p-8">
 <h1 className="text-2xl font-semibold mb-6">Iniciar sesión</h1>
 <div className="flex gap-2 mb-4">
 <button onClick={() => setRole("Patient")} className={`px-3 py-1 rounded ${role === "Patient" ? "bg-brand-600 text-white" : "bg-zinc-800"}`}>Paciente</button>
 <button onClick={() => setRole("Psychologist")} className={`px-3 py-1 rounded ${role === "Psychologist" ? "bg-brand-600 text-white" : "bg-zinc-800"}`}>Psicólogo</button>
 </div>
 <form onSubmit={onSubmit} className="space-y-4">
 <div>
 <label className="block text-sm text-zinc-300">Usuario</label>
 <input value={username} onChange={e => setUsername(e.target.value)} className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2" required />
 </div>
 <div>
 <label className="block text-sm text-zinc-300">Contraseña</label>
 <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2" required />
 </div>
 {error && <p className="text-red-400 text-sm">{error}</p>}
 <button disabled={loading || !antiForgeryToken} className="w-full bg-brand-600 hover:bg-brand-500 transition-colors rounded py-2 font-medium">
 {loading ? "Ingresando..." : "Ingresar"}
 </button>
 </form>
 <div className="text-right mt-2">
 <a href="/forgot" className="text-sm text-zinc-400 hover:text-zinc-200">Olvidé mi contraseña</a>
 </div>
 </div>
 </div>
 </div>
 );
}
