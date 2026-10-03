import { create } from "zustand";

import {
  getCurrentUser,
  loginUser,
  refreshAccessToken,
  updateCurrentUser,
} from "../services/auth";

import type {
  ProfileUpdateRequest,
  User,
} from "../types/auth";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  login: (
    email: string,
    password: string,
  ) => Promise<void>;

  loadUser: () => Promise<void>;

  updateProfile: (
    data: ProfileUpdateRequest,
  ) => Promise<void>;

  logout: () => void;
}

const ACCESS_TOKEN_KEY = "onehub_access_token";
const REFRESH_TOKEN_KEY = "onehub_refresh_token";

export const useAuthStore = create<AuthState>(
  (set) => ({
    user: null,

    accessToken:
      localStorage.getItem(ACCESS_TOKEN_KEY),

    refreshToken:
      localStorage.getItem(REFRESH_TOKEN_KEY),

    isAuthenticated: Boolean(
      localStorage.getItem(
        ACCESS_TOKEN_KEY,
      ),
    ),

    isLoading: false,

    isInitialized: false,

    login: async (email, password) => {
      set({
        isLoading: true,
        isInitialized: false,
      });

      try {
        const tokens = await loginUser(
          email,
          password,
        );

        localStorage.setItem(
          ACCESS_TOKEN_KEY,
          tokens.access,
        );

        localStorage.setItem(
          REFRESH_TOKEN_KEY,
          tokens.refresh,
        );

        set({
          accessToken: tokens.access,
          refreshToken: tokens.refresh,
          isAuthenticated: true,
        });

        const user =
          await getCurrentUser();

        set({
          user,
          isLoading: false,
          isInitialized: true,
        });
      } catch (error) {
        localStorage.removeItem(
          ACCESS_TOKEN_KEY,
        );

        localStorage.removeItem(
          REFRESH_TOKEN_KEY,
        );

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });

        throw error;
      }
    },

    loadUser: async () => {
      /*
       * Prevent duplicate initialization requests.
       */
      const currentState =
        useAuthStore.getState();

      if (currentState.isLoading) {
        return;
      }

      const accessToken =
        localStorage.getItem(
          ACCESS_TOKEN_KEY,
        );

      const refreshToken =
        localStorage.getItem(
          REFRESH_TOKEN_KEY,
        );

      /*
       * No access token means the user is logged out.
       */
      if (!accessToken) {
        set({
          user: null,
          accessToken: null,
          refreshToken,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });

        return;
      }

      set({
        isLoading: true,
        isInitialized: false,
      });

      /*
       * First try the existing access token.
       */
      try {
        const user =
          await getCurrentUser();

        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });

        return;
      } catch {
        /*
         * Access token may be expired.
         * Continue to refresh-token flow.
         */
      }

      /*
       * No refresh token means the session cannot
       * be restored.
       */
      if (!refreshToken) {
        localStorage.removeItem(
          ACCESS_TOKEN_KEY,
        );

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });

        return;
      }

      /*
       * Refresh the access token.
       */
      try {
        const response =
          await refreshAccessToken(
            refreshToken,
          );

        localStorage.setItem(
          ACCESS_TOKEN_KEY,
          response.access,
        );

        /*
         * Fetch the user using the new token.
         */
        const user =
          await getCurrentUser();

        set({
          user,
          accessToken: response.access,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
      } catch {
        /*
         * Refresh token is invalid/expired.
         * Clear the complete session.
         */
        localStorage.removeItem(
          ACCESS_TOKEN_KEY,
        );

        localStorage.removeItem(
          REFRESH_TOKEN_KEY,
        );

        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
      }
    },

    updateProfile: async (data) => {
      const user =
        await updateCurrentUser(data);

      set({ user });
    },

    logout: () => {
      localStorage.removeItem(
        ACCESS_TOKEN_KEY,
      );

      localStorage.removeItem(
        REFRESH_TOKEN_KEY,
      );

      sessionStorage.clear();

      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isInitialized: true,
        isLoading: false,
      });
    },
  }),
);