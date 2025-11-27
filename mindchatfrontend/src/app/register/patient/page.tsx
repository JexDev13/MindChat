"use client";
import { useEffect, useState } from "react";
import axios from "axios";

export default function RegisterPatientPage() {
 const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [ok, setOk] = useState<string | null>(null);
 const [antiForgeryToken, setAntiForgeryToken] = useState<string | null>(null);

 function update<K extends keyof typeof form>(k: K, v: string) { setForm({ ...form, [k]: v }); }

 async function loadToken() {
 try {
 const res = await fetch("/backend/api/antiforgery", { credentials: "include" });
 const data = await res.json();
 setAntiForgeryToken(data.token || null);
 } catch { setAntiForgeryToken(null); }
 }

 useEffect(() => { loadToken(); }, []);

 async function onSubmit(e: React.FormEvent) {
 e.preventDefault();
 setError(null); setOk(null);
 if (!antiForgeryToken) { setError("No se pudo obtener el token de seguridad."); return; }
 setLoading(true);
 try {
 const body = new URLSearchParams();
 body.set("FirstName", form.firstName);
 body.set("LastName", form.lastName);
 body.set("Email", form.email);
 body.set("Password", form.password);
 body.set("ConfirmPassword", form.confirmPassword);
 body.set("__RequestVerificationToken", antiForgeryToken);
 const resp = await axios.post("/backend/Auth/RegisterPatient", body, { headers: { "Content-Type": "application/x-www-form-urlencoded", "X-XSRF-TOKEN": antiForgeryToken }, withCredentials: true, maxRedirects:0, validateStatus: s => s >=200 && s <400 });
 if (resp.status ===200) {
 setError("Revise los datos ingresados.");
 } else {
 setOk("Cuenta creada. Puede iniciar sesion.");
 setTimeout(() => (window.location.href = "/login"),800);
 }
 } catch {
 setError("No se pudo registrar. Intente nuevamente.");
 } finally { setLoading(false); }
 }

 return (
 <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0b0b19] via-[#120e27] to-[#0a1235] p-6">
 <div className="w-full max-w-lg glass p-8 border border-white/10 bg-white/5">
 <h1 className="text-2xl font-semibold mb-6">Crear cuenta paciente</h1>
 <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
 <div className="sm:col-span-1">
 <label className="block text-sm text-zinc-300">Nombre</label>
 <input value={form.firstName} onChange={e=>update("firstName", e.target.value)} className="w-full mt-1 bg-black/40 border border-white/10 rounded px-3 py-2" required />
 </div>
 <div className="sm:col-span-1">
 <label className="block text-sm text-zinc-300">Apellido</label>
 <input value={form.lastName} onChange={e=>update("lastName", e.target.value)} className="w-full mt-1 bg-black/40 border border-white/10 rounded px-3 py-2" required />
 </div>
 <div className="sm:col-span-2">
 <label className="block text-sm text-zinc-300">Email</label>
 <input type="email" value={form.email} onChange={e=>update("email", e.target.value)} className="w-full mt-1 bg-black/40 border border-white/10 rounded px-3 py-2" required />
 </div>
 <div>
 <label className="block text-sm text-zinc-300">Contrasena</label>
 <input type="password" value={form.password} onChange={e=>update("password", e.target.value)} className="w-full mt-1 bg-black/40 border border-white/10 rounded px-3 py-2" required />
 </div>
 <div>
 <label className="block text-sm text-zinc-300">Confirmar</label>
 <input type="password" value={form.confirmPassword} onChange={e=>update("confirmPassword", e.target.value)} className="w-full mt-1 bg-black/40 border border-white/10 rounded px-3 py-2" required />
 </div>
 {error && <p className="sm:col-span-2 text-red-400 text-sm">{error}</p>}
 {ok && <p className="sm:col-span-2 text-green-400 text-sm">{ok}</p>}
 <div className="sm:col-span-2">
 <button disabled={loading || !antiForgeryToken} className="w-full bg-gradient-to-r from-brand-600 to-sky-600 hover:from-brand-500 hover:to-sky-500 rounded py-2 font-medium">
 {loading ? "Creando..." : "Crear cuenta"}
 </button>
 </div>
 </form>
 <div className="text-right mt-3 text-sm">
 <a className="text-brand-300 hover:text-brand-200" href="/login">Ya tengo cuenta</a>
 </div>
 </div>
 </div>
 );
}
