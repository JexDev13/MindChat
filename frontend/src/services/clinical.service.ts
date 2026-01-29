import api from "./axios";
import {
  PatientProfile,
  PsychologistProfile,
  UpdatePatientProfileRequest,
  UpdatePsychologistProfileRequest,
  Tag,
} from "@/types";

const CLINICAL_ENDPOINTS = {
  // Patients
  GET_PATIENT_PROFILE: (userId: string) =>
    `/api/clinical/patients/${userId}`,
  UPDATE_PATIENT_PROFILE: (profileId: string) =>
    `/api/clinical/patients/${profileId}`,

  // Psychologists
  GET_ALL_PSYCHOLOGISTS: "/api/clinical/psychologists",
  GET_PSYCHOLOGIST_PROFILE: (userId: string) =>
    `/api/clinical/psychologists/${userId}`,
  UPDATE_PSYCHOLOGIST_PROFILE: (profileId: string) =>
    `/api/clinical/psychologists/${profileId}`,
  SEARCH_PSYCHOLOGISTS: "/api/clinical/psychologists/search",

  // Tags
  GET_ALL_TAGS: "/api/clinical/psychologists/tags",
};

export const clinicalService = {
  // Patient Profile
  async getPatientProfile(userId: string): Promise<PatientProfile> {
    const response = await api.get<PatientProfile>(
      CLINICAL_ENDPOINTS.GET_PATIENT_PROFILE(userId)
    );
    return response.data;
  },

  async updatePatientProfile(
    profileId: string,
    data: UpdatePatientProfileRequest
  ): Promise<PatientProfile> {
    const response = await api.put<PatientProfile>(
      CLINICAL_ENDPOINTS.UPDATE_PATIENT_PROFILE(profileId),
      data
    );
    return response.data;
  },

  // Psychologist Profile
  async getAllPsychologists(): Promise<PsychologistProfile[]> {
    const response = await api.get<PsychologistProfile[]>(
      CLINICAL_ENDPOINTS.GET_ALL_PSYCHOLOGISTS
    );
    return response.data;
  },

  async getPsychologistProfile(userId: string): Promise<PsychologistProfile> {
    const response = await api.get<PsychologistProfile>(
      CLINICAL_ENDPOINTS.GET_PSYCHOLOGIST_PROFILE(userId)
    );
    return response.data;
  },

  async updatePsychologistProfile(
    profileId: string,
    data: UpdatePsychologistProfileRequest
  ): Promise<PsychologistProfile> {
    const response = await api.put<PsychologistProfile>(
      CLINICAL_ENDPOINTS.UPDATE_PSYCHOLOGIST_PROFILE(profileId),
      data
    );
    return response.data;
  },

  async searchPsychologists(query: string): Promise<PsychologistProfile[]> {
    const response = await api.get<PsychologistProfile[]>(
      CLINICAL_ENDPOINTS.SEARCH_PSYCHOLOGISTS,
      { params: { query } }
    );
    return response.data;
  },

  // Tags
  async getAllTags(): Promise<Tag[]> {
    const response = await api.get<Tag[]>(CLINICAL_ENDPOINTS.GET_ALL_TAGS);
    return response.data;
  },
};

export default clinicalService;
