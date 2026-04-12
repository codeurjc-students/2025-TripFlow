import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordOtpRequest,
  VerifyAccountRequest,
} from "@/types/auth";
import { http } from "@services/httpService";

const BASE_PATH = "/api/auth";

/**
 * Logs in a user by sending a login request to the authentication service.
 *
 * @param request - The login request containing user details.
 * @returns A promise that resolves to an AuthResponse.
 */
export async function login(request: LoginRequest): Promise<AuthResponse> {
  return http<AuthResponse>(`${BASE_PATH}/login`, "POST", request);
}

/**
 * Logs out the current user by sending a logout request to the authentication service.
 *
 * @returns A promise that resolves to an AuthResponse.
 */
export async function logout(): Promise<AuthResponse> {
  return http<AuthResponse>(`${BASE_PATH}/logout`, "POST");
}

/**
 * Refreshes the current user's session by sending a request to the authentication service.
 *
 * @returns A promise that resolves to an AuthResponse.
 */
export async function refresh(): Promise<AuthResponse> {
  return http<AuthResponse>(`${BASE_PATH}/refresh`, "POST");
}

/**
 * Registers a new user by sending a registration request to the authentication service.
 *
 * @param request - The registration request containing user details.
 * @returns A promise that resolves to an AuthResponse.
 */
export async function register(request: RegisterRequest): Promise<AuthResponse> {
  return http<AuthResponse>(`${BASE_PATH}/register`, "POST", request);
}

/**
 * Verifies a user account by sending a verification request to the authentication service.
 *
 * @param request - The verification request containing username and code.
 * @returns A promise that resolves to an AuthResponse.
 */
export async function verify(request: VerifyAccountRequest): Promise<AuthResponse> {
  return http<AuthResponse>(`${BASE_PATH}/verify`, "POST", request);
}

/**
 * Resends the verification code to the user's email.
 *
 * @param username - The username of the user.
 * @returns A promise that resolves to an AuthResponse.
 */
export async function resendCode(username: string): Promise<AuthResponse> {
  return http<AuthResponse>(`${BASE_PATH}/resend-code`, "POST", { username });
}

export async function forgotPassword(request: ForgotPasswordRequest): Promise<AuthResponse> {
  return http<AuthResponse>(`${BASE_PATH}/forgot-password`, "POST", request);
}

export async function resetPassword(request: ResetPasswordOtpRequest): Promise<AuthResponse> {
  return http<AuthResponse>(`${BASE_PATH}/reset-password`, "POST", request);
}
