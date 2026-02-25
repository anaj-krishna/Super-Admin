// This file contains TypeScript type definitions for the authentication-related data structures used in the Super Admin dashboard application.
export interface LoginResponse {
  id: string;
  email: string;
  role: "SUPER_ADMIN";
  location: string;
  token: string;
  message: string;
}
