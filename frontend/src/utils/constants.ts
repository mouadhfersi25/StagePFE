// Constantes globales de l'application

export const ROLES = {
  JOUEUR: "JOUEUR",
  PARENT: "PARENT",
  EDUCATEUR: "EDUCATEUR",
  ADMIN: "ADMIN",
  SPONSOR: "SPONSOR",
} as const;

export const ROLE_LABELS: Record<string, string> = {
  JOUEUR: "Joueur",
  PARENT: "Parent",
  EDUCATEUR: "Éducateur",
  ADMIN: "Administrateur",
  SPONSOR: "Sponsor",
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "auth_access_token",
  REFRESH_TOKEN: "auth_refresh_token",
  ROLE: "auth_role",
  EMAIL: "auth_email",
} as const;

export const ROUTES = {
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  ADMIN_DASHBOARD: "/admin/dashboard",
} as const;
