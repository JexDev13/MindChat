"use client";

import { useAuth } from "@/store";
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui";
import {
  MessageSquare,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  Heart,
} from "lucide-react";
import Link from "next/link";

export default function PatientDashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      title: "Sesiones completadas",
      value: "12",
      icon: <MessageSquare className="h-5 w-5" />,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
    {
      title: "Próxima cita",
      value: "Hoy",
      icon: <Calendar className="h-5 w-5" />,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      title: "Días seguidos",
      value: "7",
      icon: <TrendingUp className="h-5 w-5" />,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    {
      title: "Estado emocional",
      value: "Bien",
      icon: <Heart className="h-5 w-5" />,
      color: "text-pink-400",
      bgColor: "bg-pink-500/20",
    },
  ];

  const upcomingAppointments = [
    {
      id: "1",
      psychologistName: "Dr. María García",
      date: "Hoy, 15:00",
      status: "confirmed",
    },
    {
      id: "2",
      psychologistName: "Dr. Juan López",
      date: "Mañana, 10:00",
      status: "pending",
    },
  ];

  return (
    <div className="space-y-6 animate-in">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">
          Bienvenido, {user?.fullName?.split(" ")[0] || "Usuario"} 👋
        </h1>
        <p className="text-gray-400">
          Aquí tienes un resumen de tu actividad reciente
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="hover:border-dark-600 transition-colors">
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <div className={stat.color}>{stat.icon}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Próximas Citas</CardTitle>
              <Link
                href="/dashboard/patient/appointments"
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Ver todas
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-dark-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <Calendar className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {appointment.psychologistName}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {appointment.date}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      appointment.status === "confirmed" ? "success" : "warning"
                    }
                  >
                    {appointment.status === "confirmed"
                      ? "Confirmada"
                      : "Pendiente"}
                  </Badge>
                </div>
              ))}
              {upcomingAppointments.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No tienes citas programadas
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <Link
                href="/dashboard/patient/chat"
                className="flex items-center gap-3 p-4 rounded-lg bg-dark-700/50 hover:bg-dark-700 transition-colors group"
              >
                <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                  <MessageSquare className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Iniciar chat</p>
                  <p className="text-xs text-gray-400">
                    Habla con tu psicólogo
                  </p>
                </div>
              </Link>

              <Link
                href="/dashboard/patient/appointments"
                className="flex items-center gap-3 p-4 rounded-lg bg-dark-700/50 hover:bg-dark-700 transition-colors group"
              >
                <div className="p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                  <Calendar className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">Ver citas</p>
                  <p className="text-xs text-gray-400">
                    Gestiona tus sesiones
                  </p>
                </div>
              </Link>

              <Link
                href="/dashboard/patient/psychologists"
                className="flex items-center gap-3 p-4 rounded-lg bg-dark-700/50 hover:bg-dark-700 transition-colors group"
              >
                <div className="p-2 rounded-lg bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                  <Users className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">
                    Buscar psicólogos
                  </p>
                  <p className="text-xs text-gray-400">
                    Encuentra un profesional
                  </p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
