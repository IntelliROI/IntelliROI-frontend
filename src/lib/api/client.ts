import axios, { AxiosError, type AxiosInstance } from "axios";
import { services, type ServiceKey, useMocks } from "@/config/site";

declare module "axios" {
  interface AxiosRequestConfig {
    skipAuth?: boolean;
    accessToken?: string | null;
  }
}

export class ApiError extends Error {
  status: number;
  body: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("intelliroi_access_token");
}

function unwrapData<T>(payload: unknown): T {
  if (
    typeof payload === "object" &&
    payload !== null &&
    "data" in payload &&
    (payload as { data: unknown }).data !== undefined
  ) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}

function toApiError(err: unknown): ApiError {
  if (err instanceof ApiError) return err;
  if (axios.isCancel(err)) {
    return new ApiError("Request cancelled", 408);
  }
  if (err instanceof AxiosError) {
    const body = err.response?.data;
    const message =
      typeof body === "object" &&
      body !== null &&
      "message" in body &&
      typeof (body as { message: unknown }).message === "string"
        ? (body as { message: string }).message
        : err.code === "ECONNABORTED"
          ? "Request timed out"
          : (err.message ?? `Request failed (${err.response?.status ?? 0})`);
    return new ApiError(
      message,
      err.response?.status ?? (err.code === "ECONNABORTED" ? 408 : 0),
      body,
    );
  }
  return new ApiError(err instanceof Error ? err.message : "Request failed", 0);
}

const clients = new Map<ServiceKey, AxiosInstance>();

function createClient(baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  instance.interceptors.request.use((config) => {
    if (config.skipAuth) return config;
    const token =
      config.accessToken !== undefined ? config.accessToken : getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  instance.interceptors.response.use(
    (response) => {
      response.data = unwrapData(response.data);
      return response;
    },
    (error) => Promise.reject(toApiError(error)),
  );

  return instance;
}

/** Axios instance for a backend service — token + JSON handled by interceptors. */
export function http(service: ServiceKey): AxiosInstance {
  let client = clients.get(service);
  if (!client) {
    client = createClient(services[service]);
    clients.set(service, client);
  }
  return client;
}

export async function apiRequest<T>(
  service: ServiceKey,
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    token,
    headers = {},
    signal,
  } = options;

  try {
    const res = await http(service).request<T>({
      url: path,
      method,
      data: body,
      headers,
      signal,
      skipAuth: token === null,
      accessToken: token === undefined ? undefined : token,
    });
    return res.data;
  } catch (err) {
    throw toApiError(err);
  }
}

export { useMocks };
export type { ServiceKey };
