export enum Gender {
  HOMME = 'Homme',
  FEMME = 'Femme',
  ENFANT = 'Enfant'
}

export enum Role {
  DIEUWRIGN = 'Dieuwrign',
  TOPP_DIEUWRIGN = 'Topp Dieuwrign',
  DIEUWRIGN_COM_COM = 'Dieuwrign commission communication',
  DIEUWRIGN_COM_ORG = 'Dieuwrign commission organisation',
  DIEUWRIGN_COM_FIN = 'Dieuwrign commission finance',
  DIEUWRIGN_COM_SOC = 'Dieuwrign commission sociale',
  DIEUWRIGN_COM_CULT = 'Dieuwrign commission culturelle',
  DIEUWRIGN_SOKHNA_YI = 'Dieuwrign Sokhna Yi',
  DIEUWRIGN_REL_EXT = 'Dieuwrigne Commission relation exterieure',
  MEMBRE = 'Membre',
  MEMBRE_COM_COM = 'Membre commission communication',
  MEMBRE_COM_CONS = 'Membre commission conservatoire',
  MEMBRE_COM_SOC = 'Membre commission sociale',
  MEMBRE_COM_CULT = 'Membre commission culturelle',
}

export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  role: Role;
  gender: Gender;
  annualFee: number;
  
  // Nouveaux champs
  profession?: string; // Fonction dans la vie civile
  guardianName?: string; // Only if ENFANT
  guardianPhone?: string; // Only if ENFANT
  
  cardNumber: string; // Must be unique
  photoUrl?: string;
  joinDate: string; // ISO String
}

export enum UserRole {
  SUPER_ADMIN = 'Super Admin',
  ADMIN = 'Administrateur'
}

export interface User {
  id: string;
  username: string;
  password: string; // In a real app, this should be hashed. For this demo, plain text/base64.
  fullName: string;
  role: UserRole;
  photoUrl?: string;
}

export type SortField = 'lastName' | 'joinDate' | 'annualFee';
export type SortOrder = 'asc' | 'desc';

export interface DashboardStats {
  totalMembers: number;
  totalMen: number;
  totalWomen: number;
  totalChildren: number;
  totalExpectedFees: number;
}