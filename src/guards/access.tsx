import { AgroPulseAuth } from "./agropulseAuth";

export const AgroPulseAccess = {
  hasRole(role: string | string[]): boolean {
    const user = AgroPulseAuth.getUser();
    if (!user?.roles) return false;

    const required = Array.isArray(role) ? role : [role];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return user.roles.some((r:any) =>
      required.includes(r)
    );
  },

  hasPermission(permission: string | string[]): boolean {
    const user = AgroPulseAuth.getUser();
    if (!user?.permissions) return false;

    const required = Array.isArray(permission)
      ? permission
      : [permission];

    return required.every(p =>
      user.permissions.includes(p)
    );
  },

  isFarmManager(): boolean {
    return this.hasRole(["SUPER_ADMIN", "FARM_MANAGER"]);
  },

  isFarmUser(): boolean {
    return this.hasRole("FARMER");
  },
};
