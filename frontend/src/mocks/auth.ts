import type { AuthResponse } from "@/types/auth";

const date = new Date().toISOString();

export const mockAuth = {
  "/api/auth/login": async (_method: string, _body?: unknown): Promise<AuthResponse> => ({
    status: "SUCCESS",
    message: "Login successful",
    errors: {},
    user: {
      name: "Demo User",
      username: "demoUser",
      description: "This is a demo user.",
      location: "Demo City",
      createdAt: date,
      role: "USER",
      plan: "FREE",
      notificationsAllowed: true
    },
  }),

  "/api/auth/register": async (_method: string, _body?: unknown): Promise<AuthResponse> => ({
    status: "SUCCESS",
    message: "Registration successful",
    errors: {},
    user: {
      name: "Demo User",
      username: "demoUser",
      description: "This is a demo user.",
      location: "Demo City",
      createdAt: new Date().toISOString(),
      role: "USER",
      plan: "FREE",
      notificationsAllowed: true,
    },
  }),

  "/api/auth/logout": async (_method: string): Promise<AuthResponse> => ({
    status: "SUCCESS",
    message: "Logout successful",
    errors: {},
    user: null as any,
  }),

  "/api/auth/refresh": async (_method: string): Promise<AuthResponse> => ({
    status: "SUCCESS",
    message: "Token refreshed",
    errors: {},
    user: {
      name: "Demo User",
      username: "demoUser",
      description: "This is a demo user.",
      location: "Demo City",
      createdAt: date,
      role: "USER",
      plan: "FREE",
      notificationsAllowed: true
    },
  }),

  "/api/auth/forgot-password": async (_method: string, _body?: unknown): Promise<AuthResponse> => ({
    status: "SUCCESS",
    message: "A reset code was sent to your email",
    errors: {},
    user: null as any,
  }),

  "/api/auth/reset-password": async (_method: string, _body?: unknown): Promise<AuthResponse> => ({
    status: "SUCCESS",
    message: "Password reset successful",
    errors: {},
    user: null as any,
  }),
};
