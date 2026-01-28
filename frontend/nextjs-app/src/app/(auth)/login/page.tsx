import { LoginForm } from "@/components/auth/LoginForm";
import { SparklesCore } from "@/components/ui/sparkles";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-background overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 w-full h-full">
        <SparklesCore
          id="tsparticlesfullpage"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#A855F7"
        />
      </div>
      
      {/* Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000" />

      <div className="relative z-10 w-full p-4">
        <LoginForm />
      </div>
    </div>
  );
}
