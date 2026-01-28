"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { GradientButton } from "@/components/ui/gradient-button";
import { toast } from "sonner";
import { GlassCard } from "@/components/shared/GlassCard";
import { Input } from "@/components/ui/input";
import { AlertCircle, Loader2, CheckCircle } from "lucide-react";
import apiClient from "@/lib/api/client";
import Link from "next/link";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      const response = await apiClient.post('/api/auth/forgot-password', {
        email: values.email
      });

      if (response.data.success) {
        setSuccess(true);
        toast.success("Email sent!", {
          description: "Check your email for password reset instructions.",
        });
      } else {
        setErrorMessage(response.data.errors?.join(', ') || "Error sending reset email.");
        toast.error("Request failed", { 
          description: response.data.errors?.join(', ') 
        });
      }
    } catch (error: unknown) {
      const err = error as { 
        response?: { data?: { errors?: string[] }, status?: number },
        code?: string,
        message?: string 
      };
      
      let errorMsg = "Unable to connect to the server. Please try again later.";
      
      if (err.code === 'ERR_NETWORK' || err.message?.includes('Network Error')) {
        errorMsg = "Cannot connect to the server. Please check if the backend is running.";
      } else if (err.response?.data?.errors) {
        errorMsg = err.response.data.errors.join(', ');
      }
      
      setErrorMessage(errorMsg);
      toast.error("Request failed", { description: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900/20 via-background to-blue-900/20">
        <GlassCard className="w-full max-w-md mx-auto text-center p-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="mx-auto w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mb-6"
          >
            <CheckCircle className="w-10 h-10 text-green-400" />
          </motion.div>
          
          <h1 className="text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
            Check Your Email
          </h1>
          
          <p className="text-muted-foreground mb-6">
            We've sent you an email with instructions to reset your password. 
            Please check your inbox and follow the link.
          </p>
          
          <Link href="/login">
            <GradientButton className="w-full">
              Back to Login
            </GradientButton>
          </Link>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900/20 via-background to-blue-900/20">
      <GlassCard className="w-full max-w-md mx-auto">
        <div className="mb-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500 mb-2"
          >
            Forgot Password
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground"
          >
            Enter your email and we'll send you reset instructions
          </motion.p>
        </div>

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
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="block text-sm font-medium mb-2 text-foreground">
              Email Address
            </label>
            <Input
              {...register("email")}
              type="email"
              placeholder="your@email.com"
              className="bg-white/5 border-white/10 h-12 rounded-lg focus:border-purple-500 focus:ring-purple-500/20 text-white placeholder:text-zinc-500"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="pt-2"
          >
            <GradientButton 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </GradientButton>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center text-sm text-muted-foreground"
          >
            Remember your password?{" "}
            <Link 
              href="/login" 
              className="text-purple-400 hover:text-purple-300 hover:underline font-medium transition-colors"
            >
              Back to Login
            </Link>
          </motion.div>
        </form>
      </GlassCard>
    </div>
  );
}
