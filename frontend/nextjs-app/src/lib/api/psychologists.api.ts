import apiClient from './client';

export interface PsychologistProfile {
  profileId: string;
  userId: string;
  professionalLicense?: string;
  university?: string;
  graduationDate?: string;
  bio?: string;
  isVerified: boolean;
  isProfileVisible: boolean;
  tags: string[];
  // Additional fields that might be returned or joined
  firstName?: string;
  lastName?: string;
  name?: string;
  email?: string;
  profileImageUrl?: string;
}

export const psychologistsApi = {
  getAll: () => apiClient.get('/api/psychologists'),

  getByProfileId: (profileId: string) =>
    apiClient.get(`/api/psychologists/${profileId}`),

  getByUserId: (userId: string) =>
    apiClient.get(`/api/psychologists/user/${userId}`),

  searchByTags: (tags: string[]) =>
    apiClient.get(`/api/psychologists/search/tags?tags=${tags.join(',')}`),
};
