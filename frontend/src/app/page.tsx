import Link from "next/link";
import { Button } from "@/components/ui";
import { MessageSquare, Calendar, Shield, Heart } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-dark">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-dark-700/50 bg-dark-900/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
              MindChat
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="#features"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Características
            </Link>
            <Link
              href="#how-it-works"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Cómo funciona
            </Link>
            <Link
              href="#contact"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Contacto
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Iniciar sesión</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary">Registrarse</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
              MindChat
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-4">
            Welcome back to your safe space
          </p>
          <p className="text-gray-500 max-w-2xl mx-auto mb-12">
            Conectamos pacientes con psicólogos profesionales en un entorno
            seguro y confidencial. Tu bienestar mental es nuestra prioridad.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" variant="primary">
                Comenzar ahora
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Ya tengo cuenta
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
            ¿Por qué elegir MindChat?
          </h2>
          <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12">
            Ofrecemos una plataforma completa para cuidar tu salud mental
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-xl bg-dark-800/50 border border-dark-700 hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-4">
                <MessageSquare className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Chat en tiempo real
              </h3>
              <p className="text-gray-400 text-sm">
                Comunícate con tu psicólogo de forma instantánea y segura.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-xl bg-dark-800/50 border border-dark-700 hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Agenda de citas
              </h3>
              <p className="text-gray-400 text-sm">
                Programa y gestiona tus sesiones de terapia fácilmente.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-xl bg-dark-800/50 border border-dark-700 hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Privacidad total
              </h3>
              <p className="text-gray-400 text-sm">
                Tus conversaciones están protegidas y son completamente confidenciales.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-xl bg-dark-800/50 border border-dark-700 hover:border-purple-500/50 transition-colors">
              <div className="w-12 h-12 rounded-lg bg-pink-500/20 flex items-center justify-center mb-4">
                <Heart className="h-6 w-6 text-pink-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Profesionales verificados
              </h3>
              <p className="text-gray-400 text-sm">
                Todos nuestros psicólogos están verificados y certificados.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-dark-700 py-8 px-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-gray-500 text-sm">
            © 2026 MindChat. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <Link
              href="/privacy"
              className="text-gray-500 hover:text-white text-sm transition-colors"
            >
              Privacidad
            </Link>
            <Link
              href="/terms"
              className="text-gray-500 hover:text-white text-sm transition-colors"
            >
              Términos
            </Link>
            <Link
              href="/contact"
              className="text-gray-500 hover:text-white text-sm transition-colors"
            >
              Contacto
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
