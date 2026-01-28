import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-background overflow-hidden py-10">
      {/* Background Blobs */}
      <div className="absolute top-20 -left-20 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute bottom-20 -right-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      
      <div className="relative z-10 w-full p-4">
        <RegisterForm />
      </div>
    </div>
  );
}
