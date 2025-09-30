export interface User {
  id: number;
  email: string;
  name?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}
