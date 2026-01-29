// Patient Profile
export interface PatientProfile {
  profileId: string;
  userId: string;
  emotionalState?: string;
}

export interface CreatePatientProfileRequest {
  userId: string;
  emotionalState?: string;
}

export interface UpdatePatientProfileRequest {
  emotionalState?: string;
}

// Psychologist Profile
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
  // Extended fields for display
  fullName?: string;
  email?: string;
  profilePictureUrl?: string;
}

export interface CreatePsychologistProfileRequest {
  userId: string;
  professionalLicense: string;
  university: string;
  graduationDate: string;
  bio?: string;
}

export interface UpdatePsychologistProfileRequest {
  professionalLicense?: string;
  university?: string;
  graduationDate?: string;
  bio?: string;
  isProfileVisible?: boolean;
  tagIds?: string[];
}

// Tags
export interface Tag {
  id: string;
  name: string;
}
