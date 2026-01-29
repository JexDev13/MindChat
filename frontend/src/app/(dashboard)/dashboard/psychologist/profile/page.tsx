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
  Badge,
  Spinner,
} from "@/components/ui";
import {
  User,
  Mail,
  GraduationCap,
  Building,
  FileText,
  CheckCircle,
  Save,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

const profileSchema = z.object({
  bio: z.string().optional(),
  isProfileVisible: z.boolean().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function PsychologistProfilePage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["psychologist-profile", user?.profileId],
    queryFn: () => clinicalService.getPsychologistProfile(user?.profileId || ""),
    enabled: !!user?.profileId,
    retry: false, // Don't retry on error
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProfileFormData) =>
      clinicalService.updatePsychologistProfile(user?.profileId || "", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["psychologist-profile"] });
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
      bio: profile?.bio || "",
      isProfileVisible: profile?.isProfileVisible ?? true,
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

  // Show basic profile info even if API call fails
  const showProfile = profile || null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Mi Perfil Profesional</h1>
        <p className="text-gray-400">
          Gestiona tu información profesional
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
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-semibold text-white">
                Dr. {user?.fullName}
              </h2>
              {profile?.isVerified && (
                <CheckCircle className="h-5 w-5 text-green-400" />
              )}
            </div>
            <p className="text-gray-400">{user?.email}</p>
            <div className="flex gap-2 mt-3">
              {showProfile?.isVerified ? (
                <Badge variant="success">Verificado</Badge>
              ) : (
                <Badge variant="warning">Pendiente de verificación</Badge>
              )}
              {showProfile?.isProfileVisible ? (
                <Badge variant="info">Perfil visible</Badge>
              ) : (
                <Badge>Perfil oculto</Badge>
              )}
            </div>
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
              <GraduationCap className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-xs text-gray-500">Licencia Profesional</p>
                <p className="text-sm text-white">
                  {showProfile?.professionalLicense || "No especificada"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-700/50">
              <Building className="h-5 w-5 text-yellow-400" />
              <div>
                <p className="text-xs text-gray-500">Universidad</p>
                <p className="text-sm text-white">
                  {showProfile?.university || "No especificada"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-dark-700/50">
              <FileText className="h-5 w-5 text-pink-400" />
              <div>
                <p className="text-xs text-gray-500">Fecha de Graduación</p>
                <p className="text-sm text-white">
                  {showProfile?.graduationDate
                    ? formatDate(showProfile.graduationDate, "PPP")
                    : "No especificada"}
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          {showProfile?.tags && showProfile.tags.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-2">Especialidades</p>
              <div className="flex flex-wrap gap-2">
                {showProfile.tags.map((tag) => (
                  <Badge key={tag} variant="purple">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
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
                  Biografía
                </label>
                <textarea
                  className="w-full rounded-lg border border-dark-600 bg-dark-800 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 resize-none"
                  rows={4}
                  placeholder="Cuéntanos sobre ti y tu experiencia..."
                  {...register("bio")}
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-dark-600 bg-dark-800 text-purple-500 focus:ring-purple-500"
                  {...register("isProfileVisible")}
                />
                <span className="text-sm text-gray-300">
                  Hacer mi perfil visible para pacientes
                </span>
              </label>

              <Button
                type="submit"
                isLoading={updateMutation.isPending}
                leftIcon={<Save className="h-4 w-4" />}
                disabled={!user?.profileId}
              >
                Guardar Cambios
              </Button>
            </form>
          ) : (
            <div>
              <p className="text-sm text-gray-400 mb-4">
                <strong className="text-white">Biografía:</strong>{" "}
                {showProfile?.bio || "No has agregado una biografía aún."}
              </p>
              <p className="text-gray-500 text-sm">
                Haz clic en "Editar" para modificar tu información
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
