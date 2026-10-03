import axios, {
  AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";

import { API_BASE_URL } from "../config";

const ACCESS_TOKEN_KEY = "onehub_access_token";
const REFRESH_TOKEN_KEY = "onehub_refresh_token";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken =
    localStorage.getItem(REFRESH_TOKEN_KEY);

  if (!refreshToken) {
    return null;
  }

  if (!refreshPromise) {
    refreshPromise = axios
      .post<{ access: string }>(
        `${API_BASE_URL}/auth/refresh/`,
        {
          refresh: refreshToken,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
      .then((response) => {
        const newAccessToken =
          response.data.access;

        localStorage.setItem(
          ACCESS_TOKEN_KEY,
          newAccessToken,
        );

        return newAccessToken;
      })
      .catch(() => {
        localStorage.removeItem(
          ACCESS_TOKEN_KEY,
        );

        localStorage.removeItem(
          REFRESH_TOKEN_KEY,
        );

        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
}

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem(
        ACCESS_TOKEN_KEY,
      );

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },
);

api.interceptors.response.use(
  (response) => response,

  async (error: AxiosError) => {
    const originalRequest =
      error.config as
        | (InternalAxiosRequestConfig & {
            _retry?: boolean;
          })
        | undefined;

    /*
     * Only handle 401 responses.
     */
    if (
      error.response?.status !== 401 ||
      !originalRequest
    ) {
      return Promise.reject(error);
    }

    /*
     * Never retry the same request twice.
     */
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    /*
     * Never intercept the refresh endpoint itself.
     */
    if (
      originalRequest.url?.includes(
        "/auth/refresh/",
      )
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    const newAccessToken =
      await refreshAccessToken();

    if (!newAccessToken) {
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization =
      `Bearer ${newAccessToken}`;

    return api(originalRequest);
  },
);