export interface LoginResponse {
  id: string;
  email: string;
  role: "SUPER_ADMIN";
  location: string;
  token: string;
  message: string;
}
