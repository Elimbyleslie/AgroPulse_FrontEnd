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
} 

export interface UserLoginForm {
  email: string;
  password: string;
}

export interface UserRegisterForm {
  name: string;
  userName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
  phone?: string;
  photo?: string;
}

export interface UpdatePasswordForm {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordForm {
  password: string;
  newPassword: string;
}
