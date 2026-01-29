"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { chatService } from "@/services";
import { useAuth } from "@/store";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
  Button,
  Avatar,
  Spinner,
} from "@/components/ui";
import { formatRelativeTime } from "@/lib/utils";
import { FileText, CheckCircle, XCircle, MessageSquare } from "lucide-react";

export default function SessionRequestsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: requests = [], isLoading } = useQuery({
    queryKey: ["session-requests", user?.profileId],
    queryFn: () =>
      chatService.getSessionRequestsByPsychologist(user?.profileId || ""),
    enabled: !!user?.profileId,
  });

  const acceptMutation = useMutation({
    mutationFn: async (requestId: string) => {
      // Update status to Accepted
      await chatService.updateSessionStatus(requestId, { status: "Accepted" });
      // Create chat for the session
      const chat = await chatService.createChat(requestId);
      return chat;
    },
    onSuccess: (chat) => {
      queryClient.invalidateQueries({ queryKey: ["session-requests"] });
      // Navigate to chat
      router.push(`/dashboard/psychologist/chat?chatId=${chat.id}`);
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requestId: string) =>
      chatService.updateSessionStatus(requestId, { status: "Rejected" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-requests"] });
    },
  });

  const pendingRequests = requests.filter((r) => r.status === "Pending");
  const acceptedRequests = requests.filter((r) => r.status === "Accepted");
  const rejectedRequests = requests.filter((r) => r.status === "Rejected");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return <Badge variant="warning">Pendiente</Badge>;
      case "Accepted":
        return <Badge variant="success">Aceptada</Badge>;
      case "Rejected":
        return <Badge variant="danger">Rechazada</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

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
        <h1 className="text-2xl font-bold text-white mb-1">
          Solicitudes de Sesión
        </h1>
        <p className="text-gray-400">
          Gestiona las solicitudes de nuevos pacientes
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-yellow-500/20">
                <FileText className="h-6 w-6 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {pendingRequests.length}
                </p>
                <p className="text-sm text-gray-400">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-green-500/20">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {acceptedRequests.length}
                </p>
                <p className="text-sm text-gray-400">Aceptadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-red-500/20">
                <XCircle className="h-6 w-6 text-red-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {rejectedRequests.length}
                </p>
                <p className="text-sm text-gray-400">Rechazadas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Requests */}
      <Card>
        <CardHeader>
          <CardTitle>Solicitudes Pendientes</CardTitle>
        </CardHeader>
        <CardContent>
          {pendingRequests.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">No tienes solicitudes pendientes</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-4 rounded-lg bg-dark-700/50 border border-dark-600"
                >
                  <div className="flex items-start gap-4">
                    <Avatar name={request.patientName || "Paciente"} size="lg" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-white">
                            {request.patientName || "Paciente"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatRelativeTime(request.createdAt)}
                          </p>
                        </div>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-sm text-gray-400 mb-4">
                        {request.initialMessage || "Sin mensaje inicial"}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => acceptMutation.mutate(request.id)}
                          isLoading={acceptMutation.isPending}
                          leftIcon={<CheckCircle className="h-4 w-4" />}
                        >
                          Aceptar
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => rejectMutation.mutate(request.id)}
                          isLoading={rejectMutation.isPending}
                          leftIcon={<XCircle className="h-4 w-4" />}
                        >
                          Rechazar
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Accepted Requests */}
      {acceptedRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Solicitudes Aceptadas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {acceptedRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-dark-700/30"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={request.patientName || "Paciente"} size="sm" />
                    <div>
                      <p className="text-sm font-medium text-white">
                        {request.patientName || "Paciente"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatRelativeTime(request.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(request.status)}
                    {request.chatId && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          router.push(
                            `/dashboard/psychologist/chat?chatId=${request.chatId}`
                          )
                        }
                        leftIcon={<MessageSquare className="h-4 w-4" />}
                      >
                        Ir al chat
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
