"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { appointmentService } from "@/services";
import { useAuth } from "@/store";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  Modal,
  Input,
  Spinner,
} from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { Calendar, Clock, User, Plus, X } from "lucide-react";

const appointmentSchema = z.object({
  patientId: z.string().min(1, "Selecciona un paciente"),
  scheduledAt: z.string().min(1, "La fecha es requerida"),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

export default function PsychologistAppointmentsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments", "psychologist", user?.profileId],
    queryFn: () => appointmentService.getByPsychologist(user?.profileId || ""),
    enabled: !!user?.profileId,
  });

  const createMutation = useMutation({
    mutationFn: appointmentService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      setIsModalOpen(false);
      reset();
    },
  });

  const cancelMutation = useMutation({
    mutationFn: appointmentService.cancel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
  });

  const onSubmit = (data: AppointmentFormData) => {
    createMutation.mutate({
      psychologistId: user?.profileId || "",
      patientId: data.patientId,
      scheduledAt: data.scheduledAt,
      notes: data.notes,
    });
  };

  const todayAppointments = appointments.filter((apt) => {
    const today = new Date();
    const aptDate = new Date(apt.scheduledAt);
    return (
      !apt.isCancelled &&
      aptDate.toDateString() === today.toDateString()
    );
  });

  const upcomingAppointments = appointments.filter((apt) => {
    const today = new Date();
    const aptDate = new Date(apt.scheduledAt);
    return (
      !apt.isCancelled &&
      aptDate > today &&
      aptDate.toDateString() !== today.toDateString()
    );
  });

  const pastAppointments = appointments.filter(
    (apt) => new Date(apt.scheduledAt) < new Date() && !apt.isCancelled
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Gestión de Citas</h1>
          <p className="text-gray-400">
            Administra las sesiones con tus pacientes
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="h-4 w-4" />}>
          Nueva Cita
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <Calendar className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {todayAppointments.length}
                </p>
                <p className="text-sm text-gray-400">Citas hoy</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <Clock className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {upcomingAppointments.length}
                </p>
                <p className="text-sm text-gray-400">Próximas citas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/20">
                <User className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {pastAppointments.length}
                </p>
                <p className="text-sm text-gray-400">Sesiones completadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Today's Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Citas de Hoy</CardTitle>
        </CardHeader>
        <CardContent>
          {todayAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No tienes citas programadas para hoy</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-dark-700/50 border border-dark-600"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-500/20">
                      <User className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {appointment.patientName || "Paciente"}
                      </p>
                      <p className="text-sm text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDateTime(appointment.scheduledAt)}
                      </p>
                      {appointment.notes && (
                        <p className="text-xs text-gray-500 mt-1">
                          {appointment.notes}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="info">Hoy</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => cancelMutation.mutate(appointment.id)}
                      isLoading={cancelMutation.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Appointments */}
      {upcomingAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Próximas Citas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-dark-700/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-purple-500/10">
                      <User className="h-4 w-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {appointment.patientName || "Paciente"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(appointment.scheduledAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="purple">Programada</Badge>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => cancelMutation.mutate(appointment.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create Appointment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Nueva Cita"
        description="Programa una nueva sesión con un paciente"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="ID del Paciente"
            placeholder="Ingresa el ID del paciente"
            error={errors.patientId?.message}
            {...register("patientId")}
          />

          <Input
            label="Fecha y Hora"
            type="datetime-local"
            error={errors.scheduledAt?.message}
            {...register("scheduledAt")}
          />

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Notas (opcional)
            </label>
            <textarea
              className="w-full rounded-lg border border-dark-600 bg-dark-800 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 resize-none"
              rows={3}
              placeholder="Notas adicionales..."
              {...register("notes")}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Crear Cita
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
