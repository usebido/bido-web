export const API_BASE =
  process.env.NEXT_PUBLIC_BIDO_API_BASE ?? "http://localhost:3001/api";

export class BidoApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "BidoApiError";
  }
}

export type GetAccessToken = () => Promise<string | null>;

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = await response.json();
    if (typeof payload?.message === "string") {
      return payload.message;
    }
    if (Array.isArray(payload?.message)) {
      return payload.message.join(", ");
    }
  } catch {
    // fall through to statusText
  }
  return response.statusText;
}

export async function bidoFetch<T>(
  getAccessToken: GetAccessToken,
  path: string,
  init?: RequestInit,
): Promise<T> {
  const token = await getAccessToken();

  if (!token) {
    throw new BidoApiError("Privy access token unavailable.", 401);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new BidoApiError(await readErrorMessage(response), response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
