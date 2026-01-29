"use client";

import { useQuery } from "@tanstack/react-query";
import { appointmentService } from "@/services";
import { useAuth } from "@/store";
import { Card, CardHeader, CardTitle, CardContent, Badge, Spinner } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import { Calendar, Clock, User, FileText } from "lucide-react";

export default function PatientAppointmentsPage() {
  const { user } = useAuth();

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments", "patient", user?.profileId],
    queryFn: () => appointmentService.getByPatient(user?.profileId || ""),
    enabled: !!user?.profileId,
  });

  const upcomingAppointments = appointments.filter(
    (apt) => !apt.isCancelled && new Date(apt.scheduledAt) >= new Date()
  );

  const pastAppointments = appointments.filter(
    (apt) => new Date(apt.scheduledAt) < new Date()
  );

  const cancelledAppointments = appointments.filter((apt) => apt.isCancelled);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Mis Citas</h1>
        <p className="text-gray-400">
          Gestiona tus sesiones de terapia programadas
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <Calendar className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {upcomingAppointments.length}
                </p>
                <p className="text-sm text-gray-400">Citas próximas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/20">
                <Clock className="h-6 w-6 text-green-400" />
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

        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-500/20">
                <FileText className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {cancelledAppointments.length}
                </p>
                <p className="text-sm text-gray-400">Canceladas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Próximas Citas</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No tienes citas programadas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-dark-700/50 border border-dark-600"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-purple-500/20">
                      <User className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {appointment.psychologistName || "Psicólogo"}
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
                  <Badge variant="purple">Programada</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historial de Citas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastAppointments.slice(0, 5).map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-dark-700/30"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/10">
                      <User className="h-4 w-4 text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {appointment.psychologistName || "Psicólogo"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(appointment.scheduledAt)}
                      </p>
                    </div>
                  </div>
                  <Badge variant="success">Completada</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
