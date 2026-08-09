import { services, type ServiceKey, useMocks } from "@/config/site";
import { withTimeout } from "@/lib/performance";

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
  /** Default 30s — prevents hung requests from freezing UI */
  timeoutMs?: number;
};

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("intelliroi_access_token");
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
    timeoutMs = 30_000,
  } = options;
  const base = services[service];
  const accessToken = token === undefined ? getToken() : token;
  const abortSignal = withTimeout(timeoutMs, signal);

  let res: Response;
  try {
    res = await fetch(`${base}${path}`, {
      method,
      signal: abortSignal,
      credentials: "omit",
      cache: method === "GET" ? "no-store" : "default",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError("Request timed out", 408);
    }
    throw err;
  }

  const text = await res.text();
  let json: unknown = null;
  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = text;
    }
  }

  if (!res.ok) {
    const message =
      typeof json === "object" &&
      json !== null &&
      "message" in json &&
      typeof (json as { message: unknown }).message === "string"
        ? (json as { message: string }).message
        : `Request failed (${res.status})`;
    throw new ApiError(message, res.status, json);
  }

  if (
    typeof json === "object" &&
    json !== null &&
    "data" in json &&
    (json as { data: unknown }).data !== undefined
  ) {
    return (json as { data: T }).data;
  }

  return json as T;
}

export { useMocks };
