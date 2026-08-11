import { api } from "@/services/api";
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  User,
} from "@/types";

interface ApiEnvelope<T> {
  status: string;
  data: T;
}

export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  const { data } = await api.post<ApiEnvelope<{ token: string }>>(
    "/users/login",
    payload,
  );

  return {
    token: data.data.token,
    data: {
      id: "",
      name: "",
      email: payload.email,
      role: "CUSTOMER",
    },
  };
}

export async function registerUser(payload: RegisterPayload): Promise<User> {
  const { data } = await api.post<ApiEnvelope<User>>("/users", payload);
  return data.data;
}
