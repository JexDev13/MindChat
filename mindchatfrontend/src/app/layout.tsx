import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
 title: "MindChat",
 description: "Plataforma de psicologos y pacientes",
};

export default function RootLayout({
 children,
}: Readonly<{
 children: React.ReactNode;
}>) {
 return (
 <html lang="es" suppressHydrationWarning>
 <body className="min-h-screen bg-gradient-to-br from-[#0b0b19] via-[#0f0f2a] to-[#0a1235] text-zinc-100 antialiased">
 {children}
 </body>
 </html>
 );
}
