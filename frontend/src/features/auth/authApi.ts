const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1";

type ErrorBody = { code?: string; message?: string; details?: unknown };
type Envelope<T> = { success?: boolean; data?: T; error?: ErrorBody };

export class ApiError extends Error {
  status: number;
  code: string;
  fields: Record<string, string>;

  constructor(message: string, status: number, code: string, fields: Record<string, string> = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

// Assumes error.details looks like [{ field, message }]. Confirm with Member 2.
function toFieldErrors(details: unknown): Record<string, string> {
  const out: Record<string, string> = {};
  if (!Array.isArray(details)) return out;
  for (const d of details) {
    if (d && typeof d === "object") {
      const { field, message } = d as { field?: unknown; message?: unknown };
      if (typeof field === "string" && typeof message === "string") out[field] = message;
    }
  }
  return out;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include", // lets the browser keep the refresh-token cookie
      body: JSON.stringify(body),
    });
  } catch {
    throw new ApiError("Cannot reach the server. Check your connection and try again.", 0, "NETWORK_ERROR");
  }

  let json: Envelope<T> | null = null;
  try {
    json = (await res.json()) as Envelope<T>;
  } catch {
    json = null;
  }

  if (!res.ok || json?.success === false) {
    const err = json?.error;
    const code = err?.code ?? "UNKNOWN";
    const message =
      code === "RATE_LIMITED"
        ? "Too many attempts. Please wait a few minutes and try again."
        : err?.message ?? "Something went wrong. Please try again.";
    throw new ApiError(message, res.status, code, toFieldErrors(err?.details));
  }
  return json?.data as T;
}

export type RegisterInput = {
  email: string;
  username: string;
  password: string;
  displayName: string;
};

export function register(input: RegisterInput) {
  return post<unknown>("/auth/register", input);
}

type LoginData = { accessToken?: string; token?: string; access_token?: string };

// TODO: the API doc does not name the token field. Confirm with Member 2.
export async function login(email: string, password: string): Promise<string> {
  const data = await post<LoginData>("/auth/login", { email, password });
  const token = data?.accessToken ?? data?.token ?? data?.access_token;
  if (!token) throw new ApiError("Login succeeded but no access token was returned.", 200, "NO_TOKEN");
  return token;
}

export function saveToken(token: string, remember: boolean) {
  localStorage.removeItem("accessToken");
  sessionStorage.removeItem("accessToken");
  (remember ? localStorage : sessionStorage).setItem("accessToken", token);
}