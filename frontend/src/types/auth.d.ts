import type { PublicUser } from "@/types/user";

export type AuthStatus = "SUCCESS" | "FAILURE";

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest extends LoginRequest {
    email: string;
    confirmPassword: string;
}

export interface VerifyAccountRequest {
    username: string;
    code: string;
}

export interface ResendCodeRequest {
    username: string;
}

export interface ForgotPasswordRequest {
    username: string;
}

export interface ResetPasswordOtpRequest {
    username: string;
    code: string;
    password: string;
    confirmPassword: string;
}

export interface AuthResponse {
    status: AuthStatus;
    message: string;
    errors: Record<string, string>;
    user: PublicUser;
}
