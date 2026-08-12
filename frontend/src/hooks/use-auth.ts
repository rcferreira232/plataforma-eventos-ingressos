"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

import { loginUser, registerUser } from "@/services/auth.service";
import type { LoginPayload, RegisterPayload, User } from "@/types";

const TOKEN_STORAGE_KEY = "meu-ingresso-token";
const USER_STORAGE_KEY = "meu-ingresso-user";

const ROLE_ROUTES: Record<string, string> = {
  ORGANIZER: "/organizer/dashboard",
  CUSTOMER: "/client/events",
  GATEKEEPER: "/gate/validate",
};

function getStoredUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawUser = window.localStorage.getItem(USER_STORAGE_KEY);

  if (!rawUser) {
    return null;
  }

  try {
    return JSON.parse(rawUser) as User;
  } catch {
    return null;
  }
}

function persistSession(token: string, user: User) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
  window.localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
}

function decodeJwtPayload(token: string) {
  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    return JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
  } catch {
    return null;
  }
}

export function useAuth() {
  const router = useRouter();

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await loginUser(payload);

      const tokenPayload = decodeJwtPayload(response.token);

      const role = tokenPayload?.role ?? "CUSTOMER";

      const user = {
        id: tokenPayload?.id ?? "",
        name: tokenPayload?.name ?? payload.email,
        email: payload.email,
        role,
      } as User;

      persistSession(response.token, user);

      router.push(ROLE_ROUTES[user.role] ?? "/");
    },
    [router],
  );

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const user = await registerUser(payload);

      const response = await loginUser({
        email: payload.email,
        password: payload.password,
      });

      const authUser = {
        ...user,
        role: user.role ?? "CUSTOMER",
      } as User;

      persistSession(response.token, authUser);

      router.push(ROLE_ROUTES[authUser.role] ?? "/");
    },
    [router],
  );

  const logout = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.removeItem(TOKEN_STORAGE_KEY);
    window.localStorage.removeItem(USER_STORAGE_KEY);

    router.push("/login");
  }, [router]);

  return {
    login,
    register,
    logout,
    getStoredUser,
  };
}
