import { UserRole } from "@/enums";

const hasAnyRole = (userRole: UserRole, allowedRoles: UserRole): boolean =>
  (userRole & allowedRoles) !== 0;

const isExactlyRole = (userRole: UserRole, targetRole: UserRole): boolean =>
  userRole === targetRole;

const ROLES_CAN_ACCESS_STUDIO = UserRole.STREAMER | UserRole.ADMIN;

export const Permission = {
  is: {
    viewer: (role: UserRole) => isExactlyRole(role, UserRole.VIEWER),
    streamer: (role: UserRole) => isExactlyRole(role, UserRole.STREAMER),
    admin: (role: UserRole) => isExactlyRole(role, UserRole.ADMIN),
    studioOwner: (role: UserRole) => hasAnyRole(role, ROLES_CAN_ACCESS_STUDIO),
  },

  can: {
    manageLiveStream: (role: UserRole) =>
      hasAnyRole(role, UserRole.STREAMER | UserRole.ADMIN),

    manageUsers: (role: UserRole) => isExactlyRole(role, UserRole.ADMIN),
  },

  cannot: {},
};
