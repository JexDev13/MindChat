"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { PlaceholdersAndVanishInput } from "../ui/placeholders-and-vanish-input";
import { GradientButton } from "../ui/gradient-button";
import { GlassCard } from "../shared/GlassCard";
import { User, Stethoscope, ArrowRight, ArrowLeft, Check, Upload } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const registerSchema = z.object({
  userType: z.enum(["patient", "psychologist"]),
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  // Additional fields
  specialization: z.string().optional(),
  license: z.string().optional(),
  bio: z.string().optional(),
});

type RegisterData = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(0);
  const router = useRouter();

  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      userType: "patient",
      email: "",
      password: "",
      firstName: "",
      lastName: "",
      specialization: "",
      license: "",
      bio: "",
    },
  });

  const userType = watch("userType");

  const nextStep = () => {
    setDirection(1);
    setStep((s) => s + 1);
  };

  const prevStep = () => {
    setDirection(-1);
    setStep((s) => s - 1);
  };

  const onSubmit = async (data: RegisterData) => {
    // Simulate API
    await new Promise(r => setTimeout(r, 2000));
    toast.success("Account created successfully!");
    router.push("/login");
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0,
    }),
  };

  return (
    <GlassCard className="w-full max-w-2xl mx-auto overflow-visible min-h-[520px] flex flex-col p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-500">
          Create Account
        </h2>
        <div className="flex justify-center mt-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                step >= i ? "w-8 bg-purple-600" : "w-2 bg-purple-200"
              )}
            />
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col">
        <div className="flex-1 relative overflow-hidden">
          <AnimatePresence custom={direction} mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="h-full flex flex-col justify-center items-center space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full px-2 py-4">
                  <div
                    onClick={() => setValue("userType", "patient")}
                    className={cn(
                      "cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02]",
                      userType === "patient"
                        ? "border-purple-500 bg-purple-500/10 shadow-lg shadow-purple-500/20 ring-2 ring-purple-500/30"
                        : "border-white/10 bg-white/5 hover:border-purple-400/50"
                    )}
                  >
                    <div className="flex flex-col items-center space-y-4">
                      <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600">
                        <User size={32} />
                      </div>
                      <h3 className="font-semibold text-lg">Patient</h3>
                      <p className="text-center text-sm text-muted-foreground">
                        I want to find support and talk to professionals
                      </p>
                    </div>
                  </div>

                  <div
                    onClick={() => setValue("userType", "psychologist")}
                    className={cn(
                      "cursor-pointer p-6 rounded-xl border-2 transition-all duration-300 hover:scale-[1.02]",
                      userType === "psychologist"
                        ? "border-blue-500 bg-blue-500/10 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/30"
                        : "border-white/10 bg-white/5 hover:border-blue-400/50"
                    )}
                  >
                    <div className="flex flex-col items-center space-y-4">
                      <div className="p-4 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600">
                        <Stethoscope size={32} />
                      </div>
                      <h3 className="font-semibold text-lg">Psychologist</h3>
                      <p className="text-center text-sm text-muted-foreground">
                        I want to offer my services and help patients
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-5 px-2"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium ml-1 text-foreground">First Name</label>
                    <Controller
                      name="firstName"
                      control={control}
                      render={({ field }) => (
                        <PlaceholdersAndVanishInput
                          placeholders={["John", "Jane", "Alice"]}
                          onChange={field.onChange}
                          onSubmit={(e) => e.preventDefault()}
                        />
                      )}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium ml-1 text-foreground">Last Name</label>
                    <Controller
                      name="lastName"
                      control={control}
                      render={({ field }) => (
                        <PlaceholdersAndVanishInput
                          placeholders={["Doe", "Smith", "Johnson"]}
                          onChange={field.onChange}
                          onSubmit={(e) => e.preventDefault()}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium ml-1 text-foreground">Email</label>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <PlaceholdersAndVanishInput
                        placeholders={["example@email.com"]}
                        onChange={field.onChange}
                        onSubmit={(e) => e.preventDefault()}
                      />
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium ml-1 text-foreground">Password</label>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <PlaceholdersAndVanishInput
                        type="password"
                        placeholders={["Create a strong password"]}
                        onChange={field.onChange}
                        onSubmit={(e) => e.preventDefault()}
                      />
                    )}
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="space-y-5 px-2"
              >
                {userType === 'psychologist' ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium ml-1 text-foreground">License Number</label>
                      <Controller
                        name="license"
                        control={control}
                        render={({ field }) => (
                          <PlaceholdersAndVanishInput
                            placeholders={["LIC-123456"]}
                            onChange={field.onChange}
                            onSubmit={(e) => e.preventDefault()}
                          />
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium ml-1 text-foreground">Specialization</label>
                      <Controller
                        name="specialization"
                        control={control}
                        render={({ field }) => (
                          <PlaceholdersAndVanishInput
                            placeholders={["Anxiety, Depression, etc."]}
                            onChange={field.onChange}
                            onSubmit={(e) => e.preventDefault()}
                          />
                        )}
                      />
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10">
                    <div className="mx-auto w-32 h-32 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                      <User size={64} className="text-gray-400" />
                    </div>
                    <p className="text-muted-foreground">Profile picture upload would go here</p>
                    {/* Simplified for demo */}
                  </div>
                )}
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3 }}
                className="flex flex-col items-center justify-center h-full space-y-6 text-center px-4 py-8"
              >
                <div className="p-5 rounded-full bg-green-500/20 text-green-400 border-2 border-green-500/30">
                  <Check size={40} strokeWidth={2.5} />
                </div>
                <h3 className="text-2xl font-bold text-foreground">You&apos;re all set!</h3>
                <p className="text-muted-foreground max-w-sm leading-relaxed">
                  Please review your information and click Submit to create your account. 
                  By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex justify-between mt-6 pt-6 border-t border-white/10">
          <GradientButton
            type="button"
            variant="secondary"
            onClick={prevStep}
            disabled={step === 1}
            className={cn(step === 1 && "opacity-0 pointer-events-none")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </GradientButton>

          {step < 4 ? (
            <GradientButton type="button" onClick={nextStep}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </GradientButton>
          ) : (
            <GradientButton type="submit">
              Create Account
            </GradientButton>
          )}
        </div>
      </form>
    </GlassCard>
  );
}
