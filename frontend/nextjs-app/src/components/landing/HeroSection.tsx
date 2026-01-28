"use client";

import { motion } from "framer-motion";
import { GradientButton } from "../ui/gradient-button";
import { SparklesCore } from "../ui/sparkles";
import { useRouter } from "next/navigation";

export function HeroSection() {
  const router = useRouter();

  return (
    <div className="relative h-screen w-full flex items-center justify-center overflow-hidden bg-background">
      {/* Background Sparkles */}
      <div className="absolute inset-0 w-full h-full">
        <SparklesCore
          id="hero-sparkles"
          background="transparent"
          minSize={0.6}
          maxSize={1.4}
          particleDensity={100}
          className="w-full h-full"
          particleColor="#8B5CF6"
        />
      </div>

      <div className="z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-400 text-sm font-medium mb-6 inline-block">
            Reimagining Mental Healthcare
          </span>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 via-blue-500 to-purple-600 animate-gradient pb-2">
            MindChat
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Connect with professional psychologists, track your journey, and find peace through modern therapy.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <GradientButton 
              onClick={() => router.push("/register")}
              className="px-10 py-6 text-lg"
            >
              Get Started
            </GradientButton>
            <button 
              onClick={() => router.push("/login")}
              className="px-10 py-6 text-lg font-medium text-foreground hover:text-purple-500 transition-colors"
            >
              Log In
            </button>
          </div>
        </motion.div>
      </div>
      
      {/* Gradient Blobs */}
      <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] bg-purple-600/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-blue-600/30 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
    </div>
  );
}
