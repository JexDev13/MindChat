"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { chatService } from "@/services";
import { useAuth } from "@/store";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Avatar,
  Badge,
  Button,
  Spinner,
} from "@/components/ui";
import { formatRelativeTime } from "@/lib/utils";
import { Search, MessageSquare, Calendar, User } from "lucide-react";

export default function PatientsListPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");

  // Get accepted session requests (which represent patients)
  const { data: sessionRequests = [], isLoading } = useQuery({
    queryKey: ["session-requests", "accepted", user?.profileId],
    queryFn: async () => {
      const requests = await chatService.getSessionRequestsByPsychologist(
        user?.profileId || ""
      );
      return requests.filter((r) => r.status === "Accepted");
    },
    enabled: !!user?.profileId,
  });

  const filteredPatients = sessionRequests.filter((request) =>
    request.patientName?.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Mis Pacientes</h1>
        <p className="text-gray-400">
          Lista de pacientes que has aceptado
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <User className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {sessionRequests.length}
                </p>
                <p className="text-sm text-gray-400">Total de pacientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar paciente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-dark-600 bg-dark-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Patients List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <User className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No tienes pacientes aún</p>
              <p className="text-sm text-gray-600 mt-1">
                Acepta solicitudes de sesión para ver pacientes aquí
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPatients.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-dark-700/50 border border-dark-600 hover:border-dark-500 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <Avatar
                      name={request.patientName || "Paciente"}
                      size="md"
                    />
                    <div>
                      <p className="font-medium text-white">
                        {request.patientName || "Paciente"}
                      </p>
                      <p className="text-xs text-gray-500">
                        Paciente desde {formatRelativeTime(request.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="success">Activo</Badge>
                    {request.chatId && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          router.push(
                            `/dashboard/psychologist/chat?chatId=${request.chatId}`
                          )
                        }
                        leftIcon={<MessageSquare className="h-4 w-4" />}
                      >
                        Chat
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        router.push(
                          `/dashboard/psychologist/appointments?patientId=${request.patientId}`
                        )
                      }
                      leftIcon={<Calendar className="h-4 w-4" />}
                    >
                      Agendar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
