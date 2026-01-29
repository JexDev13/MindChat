"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { clinicalService } from "@/services";
import { useAuth } from "@/store";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Avatar,
  Spinner,
} from "@/components/ui";
import { User, Mail, Heart, Save } from "lucide-react";

const profileSchema = z.object({
  emotionalState: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function PatientProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["patient-profile", user?.profileId],
    queryFn: () => clinicalService.getPatientProfile(user?.profileId || ""),
    enabled: !!user?.profileId,
    retry: false,
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProfileFormData) =>
      clinicalService.updatePatientProfile(user?.profileId || "", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patient-profile"] });
      setIsEditing(false);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    values: {
      emotionalState: profile?.emotionalState || "",
    },
  });

  const onSubmit = (data: ProfileFormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  const showProfile = profile || null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Mi Perfil</h1>
        <p className="text-gray-400">
          Gestiona tu información personal
        </p>
      </div>

      {isError && (
        <Card className="border-yellow-500/30 bg-yellow-500/10">
          <CardContent>
            <p className="text-yellow-400 text-sm">
              No se pudo cargar toda la información del perfil. Mostrando información básica.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Profile Card */}
      <Card>
        <CardContent>
          <div className="flex flex-col items-center text-center mb-6">
            <Avatar name={user?.fullName} size="xl" className="mb-4" />
            <h2 className="text-xl font-semibold text-white">
              {user?.fullName}
            </h2>
            <p className="text-gray-400">{user?.email}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-700/50">
              <User className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-xs text-gray-500">Nombre completo</p>
                <p className="text-sm text-white">{user?.fullName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-700/50">
              <Mail className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm text-white">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-700/50">
              <Heart className="h-5 w-5 text-pink-400" />
              <div>
                <p className="text-xs text-gray-500">Estado emocional</p>
                <p className="text-sm text-white">
                  {profile?.emotionalState || "No especificado"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Editar Perfil</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancelar" : "Editar"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Estado Emocional
                </label>
                <textarea
                  className="w-full rounded-lg border border-dark-600 bg-dark-800 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 resize-none"
                  rows={3}
                  placeholder="¿Cómo te sientes hoy?"
                  {...register("emotionalState")}
                />
                {errors.emotionalState && (
                  <p className="mt-1 text-sm text-red-400">
                    {errors.emotionalState.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                isLoading={updateMutation.isPending}
                leftIcon={<Save className="h-4 w-4" />}
              >
                Guardar Cambios
              </Button>
            </form>
          ) : (
            <p className="text-gray-500 text-sm">
              Haz clic en "Editar" para modificar tu información
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
