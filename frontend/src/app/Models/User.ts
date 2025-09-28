export interface User {
  id?: number | string;
  name: string;
  email: string;
  phone?: number;
  address?: string;
  password?: string;
  confirmPassword?: string;
}
