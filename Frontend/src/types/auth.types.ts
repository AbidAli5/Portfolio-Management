export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "admin" | "user";
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken?: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
}

export interface ProfileUpdate {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface ChangePassword {
  currentPassword: string;
  newPassword: string;
}
