"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { psychologistsService, PsychologistProfile } from "@/lib/api/clinical.service";
import { usersService, UserInfo } from "@/lib/api/users.service";
import { sessionRequestsService } from "@/lib/api/chat-rest.service";
import { useAuthStore } from "@/lib/store/auth.store";
import { GlassCard } from "@/components/shared/GlassCard";
import { GradientButton } from "@/components/ui/gradient-button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Loader2, Calendar, Award, Users } from "lucide-react";
import { toast } from "sonner";

interface PsychologistWithDetails extends PsychologistProfile {
  patientCount: number;
  userInfo?: UserInfo;
}

export default function PsychologistsListPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  
  const [psychologists, setPsychologists] = useState<PsychologistWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [allTags, setAllTags] = useState<string[]>([]);

  useEffect(() => {
    const fetchPsychologists = async () => {
      try {
        const allPsychologists = await psychologistsService.getAll();
        
        // Get user info for all psychologists
        const userIds = allPsychologists.map(p => p.userId);
        let userInfoMap: Map<string, UserInfo> = new Map();
        try {
          const userInfoList = await usersService.getByIds(userIds);
          userInfoList.forEach(info => userInfoMap.set(info.userId, info));
        } catch (error) {
          console.error('Failed to fetch user info:', error);
        }

        // Fetch patient counts
        const psychologistsWithDetails = await Promise.all(
          allPsychologists.map(async (psych) => {
            try {
              const sessionRequests = await sessionRequestsService.getByPsychologist(psych.profileId);
              const acceptedPatients = sessionRequests.filter(req => req.status === 'Accepted');
              return {
                ...psych,
                patientCount: acceptedPatients.length,
                userInfo: userInfoMap.get(psych.userId)
              };
            } catch {
              return {
                ...psych,
                patientCount: 0,
                userInfo: userInfoMap.get(psych.userId)
              };
            }
          })
        );

        // Collect all unique tags
        const tags = new Set<string>();
        psychologistsWithDetails.forEach(p => {
          p.tags?.forEach(t => tags.add(t));
        });
        setAllTags(Array.from(tags).sort());

        setPsychologists(psychologistsWithDetails);
      } catch (error) {
        console.error('Failed to fetch psychologists:', error);
        toast.error('Failed to load psychologists');
      } finally {
        setLoading(false);
      }
    };

    fetchPsychologists();
  }, []);

  const filteredPsychologists = psychologists.filter(psych => {
    const displayName = psych.userInfo?.fullName || 'Professional';
    const matchesSearch = 
      displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      psych.bio?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      psych.university?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTag = !selectedTag || psych.tags?.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Find a Psychologist</h1>
          <p className="text-muted-foreground mt-1">Browse and connect with licensed professionals</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
            />
          </div>
        </div>
      </div>

      {/* Tags filter */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${
              !selectedTag 
                ? 'bg-purple-500 text-white' 
                : 'bg-white/5 text-muted-foreground hover:bg-white/10'
            }`}
          >
            All
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
              className={`px-3 py-1 rounded-full text-xs transition-colors ${
                selectedTag === tag 
                  ? 'bg-purple-500 text-white' 
                  : 'bg-white/5 text-muted-foreground hover:bg-white/10'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPsychologists.length > 0 ? (
          filteredPsychologists.map((psych) => {
            const displayName = psych.userInfo?.fullName || 'Licensed Professional';
            const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'PS';
            const profilePicture = psych.userInfo?.profilePictureUrl;
            const available = psych.patientCount < 40;

            return (
              <GlassCard key={psych.profileId} className="p-6" hover>
                <div className="flex flex-col">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="h-16 w-16 border-2 border-purple-500/30">
                      {profilePicture ? (
                        <AvatarImage src={profilePicture} alt={displayName} />
                      ) : null}
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-blue-500 text-white text-lg">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg truncate">{displayName}</h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {psych.university || 'Licensed Professional'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {psych.isVerified && (
                          <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1">
                            <Award size={10} /> Verified
                          </span>
                        )}
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          available 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          <Users size={10} className="inline mr-1" />
                          {psych.patientCount}/40
                        </span>
                      </div>
                    </div>
                  </div>

                  {psych.bio && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {psych.bio}
                    </p>
                  )}

                  {psych.tags && psych.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {psych.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                      {psych.tags.length > 3 && (
                        <span className="text-xs text-muted-foreground">
                          +{psych.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 mt-auto">
                    <GradientButton 
                      className="flex-1 text-sm"
                      onClick={() => router.push(`/psychologists/${psych.profileId}`)}
                      disabled={!available}
                    >
                      <Calendar size={14} className="mr-1" />
                      {available ? 'Book Session' : 'Fully Booked'}
                    </GradientButton>
                  </div>
                </div>
              </GlassCard>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12">
            <Users className="mx-auto mb-4 opacity-50" size={48} />
            <p className="text-muted-foreground">No psychologists found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
