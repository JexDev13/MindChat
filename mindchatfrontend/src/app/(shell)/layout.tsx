export default function ShellLayout({ children }: { children: React.ReactNode }) {
 return (
 <div className="min-h-screen grid grid-rows-[auto_1fr]">
 <header className="sticky top-0 z-10 backdrop-blur bg-black/30 border-b border-white/10">
 <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
 <div className="font-semibold">MindChat</div>
 <nav className="text-sm text-zinc-300 flex gap-4">
 <a href="/dashboard" className="hover:text-white">Panel</a>
 <a href="/chat" className="hover:text-white">Chat</a>
 <a href="/appointments" className="hover:text-white">Citas</a>
 </nav>
 </div>
 </header>
 <main className="mx-auto max-w-6xl w-full p-4">{children}</main>
 </div>
 );
}
