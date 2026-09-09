import { User} from "./user"
export interface Role {
  id?: number;
  name: string;
  description?: string | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  permissions?: RolePermission[];   
  users?: UserRole[];
  _count?: {
    users: number;
    permissions: number;
  };
}
export interface Permission {
  id?: number;
  code: string;
  description: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface UserRole {
  userId: number;
  roleId: number;
  assignedBy: string;
  assignedAt?: string | Date;
  user?: User;
  role?: Role;
}

export interface RolePermission {
  roleId: number;
  permissionId: number;
  role?: Role;
  permission?: Permission;
}
