import axios, { AxiosError, type AxiosInstance } from "axios";
import { services, type ServiceKey } from "@/config/site";

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

export function getStoredCompany(): { id?: number; uuid?: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("intelliroi-auth");
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      state?: { company?: { id?: number; uuid?: string } };
    };
    return parsed.state?.company ?? null;
  } catch {
    return null;
  }
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
        : err.response?.status === 403
          ? "Not allowed (403). Your role may not have permission for this action."
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

/**
 * Fail fast: a hung/unreachable Go service should not freeze the UI for
 * 30-60s. 10s is generous for localhost but still bounded.
 */
const REQUEST_TIMEOUT_MS = 10_000;

function createClient(service: ServiceKey, baseURL: string): AxiosInstance {
  const instance = axios.create({
    baseURL,
    timeout: REQUEST_TIMEOUT_MS,
    headers: {
      Accept: "application/json",
    },
  });

  instance.interceptors.request.use((config) => {
    const method = (config.method ?? "get").toLowerCase();
    const hasBody =
      config.data !== undefined && config.data !== null && config.data !== "";
    if (hasBody && method !== "get" && method !== "head") {
      config.headers.set("Content-Type", "application/json");
    }

    if (!config.skipAuth) {
      const token =
        config.accessToken !== undefined ? config.accessToken : getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Tenant context (company_id/company_uuid) is derived server-side from the
    // JWT's company_id claim on every service — never from client-supplied
    // headers or body fields. Custom headers here would also fail CORS
    // (services only allow Content-Type/Authorization/Accept), turning every
    // request into a blocked preflight instead of a clean 403/200.
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
    client = createClient(service, services[service]);
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

export type { ServiceKey };
