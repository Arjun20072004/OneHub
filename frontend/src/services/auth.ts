import { api } from "./api";

import type {
  LoginResponse,
  RegisterRequest,
  ProfileUpdateRequest,
  User,
} from "../types/auth";

export interface RegisterResponse {
  detail: string;
  email: string;
}

export interface VerifyRegistrationOTPResponse {
  detail: string;
  email: string;
}

export interface ResendRegistrationOTPResponse {
  detail: string;
  email?: string;
}

export async function registerUser(
  data: RegisterRequest,
): Promise<RegisterResponse> {
  const response = await api.post<RegisterResponse>(
    "/auth/register/",
    data,
  );

  return response.data;
}

export async function verifyRegistrationOTP(
  email: string,
  otp: string,
): Promise<VerifyRegistrationOTPResponse> {
  const response =
    await api.post<VerifyRegistrationOTPResponse>(
      "/auth/register/verify-otp",
      {
        email,
        otp,
      },
    );

  return response.data;
}

export async function resendRegistrationOTP(
  email: string,
): Promise<ResendRegistrationOTPResponse> {
  const response =
    await api.post<ResendRegistrationOTPResponse>(
      "/auth/register/resend-otp",
      {
        email,
      },
    );

  return response.data;
}

export async function loginUser(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await api.post<LoginResponse>(
    "/auth/login/",
    {
      email,
      password,
    },
  );

  return response.data;
}

export async function getCurrentUser(): Promise<User> {
  const response = await api.get<User>("/auth/me/");

  return response.data;
}

export async function refreshAccessToken(
  refresh: string,
): Promise<{ access: string }> {
  const response = await api.post<{ access: string }>(
    "/auth/refresh/",
    {
      refresh,
    },
  );

  return response.data;
}

export async function updateCurrentUser(
  data: ProfileUpdateRequest,
): Promise<User> {
  const response = await api.patch<User>(
    "/auth/me/",
    data,
  );

  return response.data;
}