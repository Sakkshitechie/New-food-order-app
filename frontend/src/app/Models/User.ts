export interface User {
  id?: number | string;
  _id?: number | string;
  name: string;
  email: string;
  phone?: number;
  address?: string;
  password?: string;
  confirmPassword?: string;
}

export interface UserMessage extends User {
  user: User;
  status: 'success' | 'error';
  message: string;
}