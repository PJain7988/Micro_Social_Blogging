const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000/api/v1";

type FieldErrors = Record<string, string>;

type Envelope<T> = {
  success?: boolean;
  message?: string;
  data?: T;
  errors?: Record<string, string[] | undefined>;
};

export class ApiError extends Error {
  status: number;
  fields: FieldErrors;

  constructor(message: string, status: number, fields: FieldErrors = {}) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

// The backend sends validation errors as { fieldName: ["message", ...] }.
// We show the first message for each field.
function toFieldErrors(errors: Envelope<unknown>["errors"]): FieldErrors {
  const out: FieldErrors = {};
  if (!errors) return out;
  for (const [field, messages] of Object.entries(errors)) {
    if (messages && messages.length > 0) out[field] = messages[0];
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
    throw new ApiError("Cannot reach the server. Check your connection and try again.", 0);
  }

  let json: Envelope<T> | null = null;
  try {
    json = (await res.json()) as Envelope<T>;
  } catch {
    json = null;
  }

  if (!res.ok || json?.success === false) {
    throw new ApiError(
      json?.message ?? "Something went wrong. Please try again.",
      res.status,
      toFieldErrors(json?.errors)
    );
  }
  return json?.data as T;
}

type AuthResult = { accessToken: string };

export type RegisterInput = {
  username: string;
  email: string;
  displayName: string;
  password: string;
  confirmPassword: string;
};

// Register also logs the user in: the backend returns an access token.
export async function register(input: RegisterInput): Promise<string> {
  const data = await post<AuthResult>("/auth/register", input);
  return data.accessToken;
}

// "identifier" can be an email or a username.
export async function login(identifier: string, password: string): Promise<string> {
  const data = await post<AuthResult>("/auth/login", { identifier, password });
  return data.accessToken;
}

export function saveToken(token: string, remember: boolean) {
  localStorage.removeItem("accessToken");
  sessionStorage.removeItem("accessToken");
  (remember ? localStorage : sessionStorage).setItem("accessToken", token);
}