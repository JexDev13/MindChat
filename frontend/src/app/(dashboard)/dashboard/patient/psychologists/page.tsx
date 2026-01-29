"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { clinicalService, chatService } from "@/services";
import { useAuth } from "@/store";
import {
  Card,
  CardContent,
  Button,
  Avatar,
  Badge,
  Input,
  Spinner,
  Modal,
} from "@/components/ui";
import {
  Search,
  GraduationCap,
  Building,
  CheckCircle,
  MessageSquare,
} from "lucide-react";
import { PsychologistProfile } from "@/types";

export default function SearchPsychologistsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPsychologist, setSelectedPsychologist] =
    useState<PsychologistProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [initialMessage, setInitialMessage] = useState("");

  const { data: psychologists = [], isLoading } = useQuery({
    queryKey: ["psychologists"],
    queryFn: clinicalService.getAllPsychologists,
  });

  const createRequestMutation = useMutation({
    mutationFn: async () => {
      // First assign the psychologist, then create session request
      const request = await chatService.createSessionRequest({
        patientId: user?.profileId || "",
        initialMessage: initialMessage,
      });
      // Assign psychologist to the request
      await chatService.assignPsychologist(
        request.id,
        selectedPsychologist?.profileId || ""
      );
      return request;
    },
    onSuccess: () => {
      setIsModalOpen(false);
      setInitialMessage("");
      setSelectedPsychologist(null);
      // Show success message or redirect
    },
  });

  const filteredPsychologists = psychologists.filter(
    (p) =>
      p.isProfileVisible &&
      (p.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.university?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags?.some((tag) =>
          tag.toLowerCase().includes(searchQuery.toLowerCase())
        ))
  );

  const handleContactClick = (psychologist: PsychologistProfile) => {
    setSelectedPsychologist(psychologist);
    setIsModalOpen(true);
  };

  const handleSendRequest = () => {
    if (initialMessage.trim()) {
      createRequestMutation.mutate();
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
          Buscar Psicólogos
        </h1>
        <p className="text-gray-400">
          Encuentra el profesional adecuado para ti
        </p>
      </div>

      {/* Search */}
      <Card>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar por nombre, universidad o especialidad..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-dark-600 bg-dark-800 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredPsychologists.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Search className="h-12 w-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No se encontraron psicólogos</p>
          </div>
        ) : (
          filteredPsychologists.map((psychologist) => (
            <Card
              key={psychologist.profileId}
              className="hover:border-purple-500/50 transition-colors"
            >
              <CardContent>
                <div className="flex flex-col items-center text-center">
                  <Avatar
                    name={psychologist.fullName}
                    src={psychologist.profilePictureUrl}
                    size="lg"
                    className="mb-3"
                  />
                  <div className="flex items-center gap-1 mb-1">
                    <h3 className="font-semibold text-white">
                      Dr. {psychologist.fullName || "Psicólogo"}
                    </h3>
                    {psychologist.isVerified && (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    )}
                  </div>

                  {psychologist.university && (
                    <p className="text-xs text-gray-400 flex items-center gap-1 mb-2">
                      <Building className="h-3 w-3" />
                      {psychologist.university}
                    </p>
                  )}

                  {psychologist.professionalLicense && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mb-3">
                      <GraduationCap className="h-3 w-3" />
                      {psychologist.professionalLicense}
                    </p>
                  )}

                  {psychologist.bio && (
                    <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                      {psychologist.bio}
                    </p>
                  )}

                  {psychologist.tags && psychologist.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center mb-4">
                      {psychologist.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="purple" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={() => handleContactClick(psychologist)}
                    className="w-full"
                    leftIcon={<MessageSquare className="h-4 w-4" />}
                  >
                    Contactar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Contact Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Solicitar sesión"
        description={`Envía una solicitud a Dr. ${selectedPsychologist?.fullName || "Psicólogo"}`}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">
              Mensaje inicial
            </label>
            <textarea
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              className="w-full rounded-lg border border-dark-600 bg-dark-800 px-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 resize-none"
              rows={4}
              placeholder="Cuéntale al psicólogo brevemente por qué deseas iniciar terapia..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSendRequest}
              isLoading={createRequestMutation.isPending}
              disabled={!initialMessage.trim()}
            >
              Enviar Solicitud
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
