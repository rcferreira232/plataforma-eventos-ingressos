"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { loginUser, registerUser } from "@/services/auth.service";
import type { LoginPayload, RegisterPayload, User } from "@/types";

const TOKEN_STORAGE_KEY = "meu-ingresso-token"; // Amazenar no env dps
const USER_STORAGE_KEY = "meu-ingresso-user"; // Amazenar no env dps

function getStoredUser(): User | null {
  if (typeof window === "undefined") {
    return null;
  }

  const rawUser = window.localStorage.getItem(USER_STORAGE_KEY);
  return rawUser ? (JSON.parse(rawUser) as User) : null;
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

function redirectByRole(role: string) {
  const routes: Record<string, string> = {
    ORGANIZER: "/organizer/dashboard",
    CUSTOMER: "/client/events",
    GATEKEEPER: "/gate/validate",
  };

  const destination = routes[role] ?? "/";
  if (typeof window !== "undefined") {
    window.location.assign(destination);
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
      redirectByRole(user.role);
      router.refresh();
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
      redirectByRole(authUser.role);
      router.refresh();
    },
    [router],
  );

  const logout = useCallback(() => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(TOKEN_STORAGE_KEY);
      window.localStorage.removeItem(USER_STORAGE_KEY);
      router.push("/login");
    }
  }, [router]);

  return {
    login,
    register,
    logout,
    getStoredUser,
  };
}
