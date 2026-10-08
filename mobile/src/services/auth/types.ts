export interface User {
  id: string | number;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  message?: string;
  user: User;
  token: string;
}

export interface CurrentUserResponse {
  user: User;
}

export interface ProfileResponse {
  user: User;
}
