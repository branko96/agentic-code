export type LoginInput = {
  email: string;
  password: string;
};

export type AuthUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type ApiErrorResponse = {
  message?: string | string[];
};
