export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  isBanned: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type CreateUserInput = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export type UpdateUserInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
};
