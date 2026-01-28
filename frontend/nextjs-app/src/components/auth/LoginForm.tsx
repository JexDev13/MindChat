"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { GradientButton } from "../ui/gradient-button";
import { useAuthStore } from "@/lib/store/auth.store";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { GlassCard } from "../shared/GlassCard";
import { Input } from "../ui/input";
import { AlertCircle, Loader2 } from "lucide-react";
import apiClient from "@/lib/api/client";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  userType: z.enum(["patient", "psychologist"]).default("patient"),
});

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const login = useAuthStore((state) => state.login);

  const [userType, setUserType] = useState<"patient" | "psychologist">("patient");

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      userType: "patient",
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Call real API based on user type
      const endpoint = userType === 'psychologist' 
        ? '/api/auth/psychologist/login' 
        : '/api/auth/patient/login';
      
      const response = await apiClient.post(endpoint, {
        email: values.email,
        password: values.password
      });

      const data = response.data;
      
      if (data.success) {
        // Store token in localStorage and cookie for middleware
        localStorage.setItem('authToken', data.token);
        document.cookie = `authToken=${data.token}; path=/; max-age=86400`;
        
        // Parse user data from response
        const nameParts = data.fullName?.split(' ') || ['User'];
        login({ 
          id: data.userId, 
          email: data.email, 
          firstName: nameParts[0], 
          lastName: nameParts.slice(1).join(' ') || '', 
          userType: data.role?.toLowerCase() === 'psychologist' ? 'psychologist' : 'patient',
          profilePictureUrl: undefined 
        }, data.token);
        
        toast.success("Welcome back!", {
          description: "You have successfully logged in.",
        });
        
        // Use window.location for more reliable navigation
        window.location.href = "/dashboard";
      } else {
        const errorMsg = data.errors?.join(', ') || "Invalid email or password.";
        setErrorMessage(errorMsg);
        toast.error("Login failed", { description: errorMsg });
      }
    } catch (error: unknown) {
      let errorMsg = "Unable to connect to the server. Please try again later.";
      
      const err = error as { 
        response?: { data?: { errors?: string[] }, status?: number },
        code?: string,
        message?: string 
      };
      
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        errorMsg = "Cannot connect to the server. Please check if the backend is running.";
      } else if (err.response?.status === 400) {
        errorMsg = err.response?.data?.errors?.join(', ') || "Invalid email or password.";
      } else if (err.response?.status === 401) {
        errorMsg = "Invalid email or password.";
      } else if (err.response?.status === 500) {
        errorMsg = "Server error. Please try again later.";
      } else if (err.response?.data?.errors) {
        errorMsg = err.response.data.errors.join(', ');
      }
      
      setErrorMessage(errorMsg);
      toast.error("Login failed", { description: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <GlassCard className="w-full max-w-md mx-auto overflow-hidden relative z-20">
      <div className="mb-8 text-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 mb-2"
        >
          MindChat
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-muted-foreground"
        >
          Welcome back to your safe space
        </motion.p>
        
        {/* User Type Selector */}
        <div className="flex gap-2 mt-4 justify-center">
          <button
            type="button"
            onClick={() => setUserType("patient")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              userType === "patient"
                ? "bg-purple-500 text-white"
                : "bg-white/5 text-muted-foreground hover:bg-white/10"
            )}
          >
            Patient
          </button>
          <button
            type="button"
            onClick={() => setUserType("psychologist")}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              userType === "psychologist"
                ? "bg-blue-500 text-white"
                : "bg-white/5 text-muted-foreground hover:bg-white/10"
            )}
          >
            Psychologist
          </button>
        </div>
      </div>

      {/* Error Message Display */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-3"
        >
          <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-400">{errorMessage}</p>
        </motion.div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <label className="text-sm font-medium text-foreground">Email</label>
          <Input
            {...register("email")}
            type="email"
            placeholder="john.doe@mindchat.com"
            className="bg-white/5 border-white/10 h-12 rounded-lg focus:border-purple-500 focus:ring-purple-500/20 text-white placeholder:text-zinc-500"
            disabled={isLoading}
          />
          {errors.email && (
            <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
          )}
        </motion.div>

        <motion.div 
          className="space-y-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <label className="text-sm font-medium text-foreground">Password</label>
          <Input
            {...register("password")}
            type="password"
            placeholder="••••••••"
            className="bg-white/5 border-white/10 h-12 rounded-lg focus:border-purple-500 focus:ring-purple-500/20 text-white placeholder:text-zinc-500"
            disabled={isLoading}
          />
          {errors.password && (
            <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
          )}
          <div className="flex justify-end mt-2">
            <a 
              href="/forgot-password" 
              className="text-sm text-purple-400 hover:text-purple-300 hover:underline transition-colors"
            >
              Forgot password?
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="pt-2"
        >
          <GradientButton 
            type="submit" 
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </GradientButton>
        </motion.div>

        <motion.div 
          className="text-center text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Don&apos;t have an account?{" "}
          <a href="/register" className="text-purple-400 hover:text-purple-300 hover:underline font-medium transition-colors">
            Sign up
          </a>
        </motion.div>
      </form>
    </GlassCard>
  );
}
