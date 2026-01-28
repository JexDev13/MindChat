"use client";

import { BentoGrid, BentoGridItem } from "../ui/bento-grid";
import { MessageSquare, Calendar, Shield, Users, Brain, Activity } from "lucide-react";
import { motion } from "framer-motion";

export function FeaturesSection() {
  const items = [
    {
      title: "Real-time Chat",
      description: "Connect instantly with your therapist through secure, encrypted messaging.",
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20" />,
      icon: <MessageSquare className="h-4 w-4 text-purple-500" />,
    },
    {
      title: "Easy Scheduling",
      description: "Book appointments that fit your life with our smart calendar system.",
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20" />,
      icon: <Calendar className="h-4 w-4 text-blue-500" />,
    },
    {
      title: "Secure & Private",
      description: "Your data is protected with enterprise-grade encryption and HIPAA compliance.",
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20" />,
      icon: <Shield className="h-4 w-4 text-pink-500" />,
    },
    {
      title: "Expert Professionals",
      description: "Access a network of verified, licensed psychologists and therapists.",
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-green-500/20 to-blue-500/20" />,
      icon: <Users className="h-4 w-4 text-green-500" />,
    },
    {
      title: "AI-Powered Insights",
      description: "Track your mood and progress with smart analytics and insights.",
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20" />,
      icon: <Brain className="h-4 w-4 text-yellow-500" />,
    },
    {
      title: "Wellness Resources",
      description: "Access a library of guided meditations, articles, and exercises.",
      header: <div className="flex flex-1 w-full h-full min-h-[6rem] rounded-xl bg-gradient-to-br from-red-500/20 to-purple-500/20" />,
      icon: <Activity className="h-4 w-4 text-red-500" />,
    },
  ];

  return (
    <section className="py-20 bg-background relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500"
          >
            Everything you need for your journey
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-xl text-muted-foreground"
          >
            A complete platform designed for your mental well-being.
          </motion.p>
        </div>
        
        <BentoGrid className="max-w-4xl mx-auto">
          {items.map((item, i) => (
            <BentoGridItem
              key={i}
              title={item.title}
              description={item.description}
              header={item.header}
              icon={item.icon}
              className={i === 3 || i === 6 ? "md:col-span-2" : ""}
            />
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}
