"use client";

import { useAuth } from "@/store";
import { Card, CardContent, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import {
  MessageSquare,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  FileText,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Link from "next/link";

export default function PsychologistDashboardPage() {
  const { user } = useAuth();

  const stats = [
    {
      title: "Pacientes activos",
      value: "24",
      icon: <Users className="h-5 w-5" />,
      color: "text-purple-400",
      bgColor: "bg-purple-500/20",
    },
    {
      title: "Citas hoy",
      value: "5",
      icon: <Calendar className="h-5 w-5" />,
      color: "text-blue-400",
      bgColor: "bg-blue-500/20",
    },
    {
      title: "Mensajes nuevos",
      value: "12",
      icon: <MessageSquare className="h-5 w-5" />,
      color: "text-green-400",
      bgColor: "bg-green-500/20",
    },
    {
      title: "Solicitudes pendientes",
      value: "3",
      icon: <FileText className="h-5 w-5" />,
      color: "text-yellow-400",
      bgColor: "bg-yellow-500/20",
    },
  ];

  const todayAppointments = [
    {
      id: "1",
      patientName: "Ana Martínez",
      time: "10:00",
      status: "completed",
    },
    {
      id: "2",
      patientName: "Carlos Ruiz",
      time: "11:30",
      status: "in-progress",
    },
    {
      id: "3",
      patientName: "Laura Sánchez",
      time: "14:00",
      status: "upcoming",
    },
    {
      id: "4",
      patientName: "Pedro González",
      time: "16:00",
      status: "upcoming",
    },
  ];

  const pendingRequests = [
    {
      id: "1",
      patientName: "María López",
      message: "Necesito hablar sobre ansiedad laboral...",
      time: "Hace 2h",
    },
    {
      id: "2",
      patientName: "Juan García",
      message: "Busco ayuda para manejar el estrés...",
      time: "Hace 4h",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Completada</Badge>;
      case "in-progress":
        return <Badge variant="info">En progreso</Badge>;
      case "upcoming":
        return <Badge variant="purple">Próxima</Badge>;
      default:
        return <Badge>Pendiente</Badge>;
    }
  };

  return (
    <div className="space-y-6 animate-in">
      {/* Welcome Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">
          Bienvenido, Dr. {user?.fullName?.split(" ")[0] || "Usuario"} 👋
        </h1>
        <p className="text-gray-400">
          Aquí tienes un resumen de tu actividad de hoy
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
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Today's Appointments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Citas de hoy</CardTitle>
              <Link
                href="/dashboard/psychologist/appointments"
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Ver todas
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-dark-700/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-500/20">
                      <Clock className="h-4 w-4 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {appointment.patientName}
                      </p>
                      <p className="text-xs text-gray-400">
                        {appointment.time}
                      </p>
                    </div>
                  </div>
                  {getStatusBadge(appointment.status)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Solicitudes</CardTitle>
              <Link
                href="/dashboard/psychologist/requests"
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Ver todas
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-3 rounded-lg bg-dark-700/50 space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-white">
                        {request.patientName}
                      </p>
                      <span className="text-xs text-gray-500">
                        {request.time}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2">
                      {request.message}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="primary" className="flex-1">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Aceptar
                    </Button>
                    <Button size="sm" variant="ghost" className="flex-1">
                      <XCircle className="h-3 w-3 mr-1" />
                      Rechazar
                    </Button>
                  </div>
                </div>
              ))}
              {pendingRequests.length === 0 && (
                <p className="text-center text-gray-500 py-4">
                  No hay solicitudes pendientes
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <Link
              href="/dashboard/psychologist/appointments?action=new"
              className="flex items-center gap-3 p-4 rounded-lg bg-dark-700/50 hover:bg-dark-700 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors">
                <Calendar className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Nueva cita</p>
                <p className="text-xs text-gray-400">Agenda una sesión</p>
              </div>
            </Link>

            <Link
              href="/dashboard/psychologist/chat"
              className="flex items-center gap-3 p-4 rounded-lg bg-dark-700/50 hover:bg-dark-700 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-blue-500/20 group-hover:bg-blue-500/30 transition-colors">
                <MessageSquare className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Mensajes</p>
                <p className="text-xs text-gray-400">Ver chats activos</p>
              </div>
            </Link>

            <Link
              href="/dashboard/psychologist/patients"
              className="flex items-center gap-3 p-4 rounded-lg bg-dark-700/50 hover:bg-dark-700 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-green-500/20 group-hover:bg-green-500/30 transition-colors">
                <Users className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Pacientes</p>
                <p className="text-xs text-gray-400">Ver lista completa</p>
              </div>
            </Link>

            <Link
              href="/dashboard/psychologist/profile"
              className="flex items-center gap-3 p-4 rounded-lg bg-dark-700/50 hover:bg-dark-700 transition-colors group"
            >
              <div className="p-2 rounded-lg bg-yellow-500/20 group-hover:bg-yellow-500/30 transition-colors">
                <TrendingUp className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-white">Mi perfil</p>
                <p className="text-xs text-gray-400">Editar información</p>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
