"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button, Input } from "@/components/ui";
import { authService } from "@/services";
import { Mail, Lock, Eye, EyeOff, User, GraduationCap, Building } from "lucide-react";

// Patient registration schema
const patientSchema = z
  .object({
    firstName: z.string().min(1, "El nombre es requerido"),
    lastName: z.string().min(1, "El apellido es requerido"),
    email: z.string().min(1, "El email es requerido").email("Email inválido"),
    password: z
      .string()
      .min(1, "La contraseña es requerida")
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

// Psychologist registration schema
const psychologistSchema = z
  .object({
    firstName: z.string().min(1, "El nombre es requerido"),
    lastName: z.string().min(1, "El apellido es requerido"),
    email: z.string().min(1, "El email es requerido").email("Email inválido"),
    professionalLicense: z.string().min(1, "La licencia profesional es requerida"),
    university: z.string().min(1, "La universidad es requerida"),
    graduationDate: z.string().min(1, "La fecha de graduación es requerida"),
    password: z
      .string()
      .min(1, "La contraseña es requerida")
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirmPassword: z.string().min(1, "Confirma tu contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

type PatientFormData = z.infer<typeof patientSchema>;
type PsychologistFormData = z.infer<typeof psychologistSchema>;

type UserRole = "patient" | "psychologist";

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("patient");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const patientForm = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const psychologistForm = useForm<PsychologistFormData>({
    resolver: zodResolver(psychologistSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      professionalLicense: "",
      university: "",
      graduationDate: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onPatientSubmit = async (data: PatientFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.registerPatient(data);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(result.errors?.[0] || "Error al registrar. Por favor, intenta de nuevo.");
      }
    } catch (err) {
      setError("Error al registrar. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  const onPsychologistSubmit = async (data: PsychologistFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await authService.registerPsychologist(data);

      if (result.success) {
        setSuccess(true);
        setTimeout(() => router.push("/login"), 2000);
      } else {
        setError(result.errors?.[0] || "Error al registrar. Por favor, intenta de nuevo.");
      }
    } catch (err) {
      setError("Error al registrar. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-dark-700 bg-dark-800/80 backdrop-blur-md p-8 shadow-xl text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">
            ¡Registro exitoso!
          </h2>
          <p className="text-gray-400">
            Redirigiendo al inicio de sesión...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-dark-700 bg-dark-800/80 backdrop-blur-md p-8 shadow-xl">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            MindChat
          </h1>
          <p className="text-gray-400">Crea tu cuenta</p>
        </div>

        {/* Role Toggle */}
        <div className="flex gap-2 p-1 mb-6 rounded-lg bg-dark-700">
          <button
            type="button"
            onClick={() => setRole("patient")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              role === "patient"
                ? "bg-purple-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Paciente
          </button>
          <button
            type="button"
            onClick={() => setRole("psychologist")}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              role === "psychologist"
                ? "bg-purple-600 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Psicólogo
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Patient Form */}
        {role === "patient" && (
          <form
            onSubmit={patientForm.handleSubmit(onPatientSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre"
                placeholder="John"
                leftIcon={<User className="h-4 w-4" />}
                error={patientForm.formState.errors.firstName?.message}
                {...patientForm.register("firstName")}
              />
              <Input
                label="Apellido"
                placeholder="Doe"
                error={patientForm.formState.errors.lastName?.message}
                {...patientForm.register("lastName")}
              />
            </div>

            <Input
              label="Email"
              type="email"
              placeholder="john.doe@example.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={patientForm.formState.errors.email?.message}
              {...patientForm.register("email")}
            />

            <Input
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              error={patientForm.formState.errors.password?.message}
              {...patientForm.register("password")}
            />

            <Input
              label="Confirmar contraseña"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              error={patientForm.formState.errors.confirmPassword?.message}
              {...patientForm.register("confirmPassword")}
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Registrarme como Paciente
            </Button>
          </form>
        )}

        {/* Psychologist Form */}
        {role === "psychologist" && (
          <form
            onSubmit={psychologistForm.handleSubmit(onPsychologistSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre"
                placeholder="John"
                leftIcon={<User className="h-4 w-4" />}
                error={psychologistForm.formState.errors.firstName?.message}
                {...psychologistForm.register("firstName")}
              />
              <Input
                label="Apellido"
                placeholder="Doe"
                error={psychologistForm.formState.errors.lastName?.message}
                {...psychologistForm.register("lastName")}
              />
            </div>

            <Input
              label="Email"
              type="email"
              placeholder="john.doe@example.com"
              leftIcon={<Mail className="h-4 w-4" />}
              error={psychologistForm.formState.errors.email?.message}
              {...psychologistForm.register("email")}
            />

            <Input
              label="Licencia Profesional"
              placeholder="PSI-12345"
              leftIcon={<GraduationCap className="h-4 w-4" />}
              error={psychologistForm.formState.errors.professionalLicense?.message}
              {...psychologistForm.register("professionalLicense")}
            />

            <Input
              label="Universidad"
              placeholder="Universidad Nacional"
              leftIcon={<Building className="h-4 w-4" />}
              error={psychologistForm.formState.errors.university?.message}
              {...psychologistForm.register("university")}
            />

            <Input
              label="Fecha de Graduación"
              type="date"
              error={psychologistForm.formState.errors.graduationDate?.message}
              {...psychologistForm.register("graduationDate")}
            />

            <Input
              label="Contraseña"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
              error={psychologistForm.formState.errors.password?.message}
              {...psychologistForm.register("password")}
            />

            <Input
              label="Confirmar contraseña"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              leftIcon={<Lock className="h-4 w-4" />}
              error={psychologistForm.formState.errors.confirmPassword?.message}
              {...psychologistForm.register("confirmPassword")}
            />

            <Button
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Registrarme como Psicólogo
            </Button>
          </form>
        )}

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-400">
          ¿Ya tienes una cuenta?{" "}
          <Link
            href="/login"
            className="text-purple-400 hover:text-purple-300 transition-colors font-medium"
          >
            Iniciar sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
