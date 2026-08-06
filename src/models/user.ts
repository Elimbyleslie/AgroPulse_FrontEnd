import { BaseEntity } from "./base";
import { organizationRes } from "./organization";

export interface User extends BaseEntity {
  id: number;
  name: string;
  userName: string;
  email: string;
  password?: string;
  phone?: string;
  photo?: string;
  emailVerified: boolean;
  defaulFarmId?: number;
  defaulOrganizationId?: number;
  onboardingComplete?: boolean;
  lastConnexion: string | Date;
  status: "active" | "inactive";
  invitationToken?: string;
  
}

export interface AuthUser {
  id: number;
  name: string;
  userName: string;
  email: string;
  phone?: string | null;
  photo?: string;
  status: string;
  emailVerified: boolean;
  roles: string[]; // On garde le tableau de strings pour simplifier
  permissions: string[];
   ownedOrganizations?: organizationRes[];  // Ajouté
  memberOrganizations?: organizationRes[]; // Ajouté
  defaultFarmId?: number;
  defaultOrganizationId?: number;
  onboardingComplete?: boolean;
} 

export interface UserLoginForm {
  email: string;
  password: string;
  onboardingComplete?: boolean;
}

export interface UserRegisterForm {
  name: string;
  userName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  phone?: string;
  photo?: string;
  defaulFarmId?: number;
  defaulOrganizationId?: number;
  invitationToken?: string;
}

export interface UpdatePasswordForm {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordForm {
  password: string;
  newPassword: string;
}
