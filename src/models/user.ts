import { BaseEntity } from "./base";

export interface User extends BaseEntity {
   name: string;
    userName:string; 
    email: string,
    password?: string;
    phone?: string;
    photo?: string;
    emailVerified: boolean;
}

export type AuthUser={
    user: User,
    roles: string[],
    permissions: string[],
    token: Token
}

export type Token ={
    type: string,
    accessToken: string,
    refreshToken?: string;
    expires_in: number;
}

export interface UserLoginForm {
  email: string;
  password: string;
}

export interface UserRegisterForm{
    name: string;
    userName:string; 
    email: string,
    password?: string;
    phone?: string;
    photo?: string;
}

export interface UpdatePasswordForm{
    oldPassword: string;
    newPassword: string;
}

export interface ChangePasswordForm{
    password: string;
    newPassword: string;
}