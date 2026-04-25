/**
 * lib/api.ts — Cliente HTTP centralizado (seguro)
 *
 * SEGURIDAD:
 * - NO lee ni escribe en localStorage/sessionStorage/cookies.
 * - El token JWT se recibe siempre como parámetro explícito.
 * - Fuente de verdad: AuthContext (memoria en runtime).
 *
 * USO:
 *   const api = createApi(token);
 *   const data = await api.get<MiTipo>('/api/v1/recurso');
 */

const API_BASE_URL: string =
  (import.meta as ImportMeta & { env: Record<string, string> }).env
    .VITE_API_URL ?? 'https://api.docktask.com';

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface RequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export interface ApiError extends Error {
  status: number;
  data: unknown;
}

export type OnUnauthorizedCallback = () => void;

// ─── Error helper ─────────────────────────────────────────────────────────────

function buildApiError(message: string, status: number, data: unknown): ApiError {
  const err = new Error(message) as ApiError;
  err.status = status;
  err.data = data;
  return err;
}

// ─── ApiClient ────────────────────────────────────────────────────────────────

export class ApiClient {
  private readonly baseURL: string;
  private readonly token: string;
  private readonly onUnauthorized: OnUnauthorizedCallback | undefined;

  constructor(token: string, onUnauthorized?: OnUnauthorizedCallback) {
    this.baseURL = API_BASE_URL;
    this.token = token;
    this.onUnauthorized = onUnauthorized;
  }

  // ── Headers ──────────────────────────────────────────────────────────────

  private buildHeaders(extra: Record<string, string> = {}): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.token}`,
      ...extra,
    };
  }

  // ── Response handler ─────────────────────────────────────────────────────

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: unknown = null;

      try {
        errorData = await response.clone().json();
      } catch {
        try {
          errorData = await response.text();
        } catch {
          errorData = null;
        }
      }

      const message =
        (errorData as Record<string, string> | null)?.error ??
        (errorData as Record<string, string> | null)?.message ??
        (typeof errorData === 'string' ? errorData : null) ??
        `HTTP Error ${response.status}`;

      // 401 → notificar al contexto de auth para que limpie el estado
      if (response.status === 401 && this.onUnauthorized) {
        this.onUnauthorized();
      }

      throw buildApiError(message, response.status, errorData);
    }

    // 204 No Content — respuesta válida sin cuerpo
    if (response.status === 204) {
      return null as unknown as T;
    }

    return response.json() as Promise<T>;
  }

  // ── GET ──────────────────────────────────────────────────────────────────

  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.buildHeaders(options.headers),
      signal: options.signal,
    });
    return this.handleResponse<T>(response);
  }

  // ── POST ─────────────────────────────────────────────────────────────────

  async post<T>(
    endpoint: string,
    data?: unknown,
    options: RequestOptions = {},
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers: this.buildHeaders(options.headers),
      body: data !== undefined ? JSON.stringify(data) : undefined,
      signal: options.signal,
    });
    return this.handleResponse<T>(response);
  }

  // ── PUT ──────────────────────────────────────────────────────────────────

  async put<T>(
    endpoint: string,
    data?: unknown,
    options: RequestOptions = {},
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PUT',
      headers: this.buildHeaders(options.headers),
      body: data !== undefined ? JSON.stringify(data) : undefined,
      signal: options.signal,
    });
    return this.handleResponse<T>(response);
  }

  // ── PATCH ────────────────────────────────────────────────────────────────

  async patch<T>(
    endpoint: string,
    data?: unknown,
    options: RequestOptions = {},
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'PATCH',
      headers: this.buildHeaders(options.headers),
      body: data !== undefined ? JSON.stringify(data) : undefined,
      signal: options.signal,
    });
    return this.handleResponse<T>(response);
  }

  // ── DELETE ───────────────────────────────────────────────────────────────

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'DELETE',
      headers: this.buildHeaders(options.headers),
      signal: options.signal,
    });
    return this.handleResponse<T>(response);
  }

  // ── UPLOAD (multipart/form-data) ─────────────────────────────────────────

  async upload<T>(
    endpoint: string,
    formData: FormData,
    options: RequestOptions = {},
  ): Promise<T> {
    // NO incluir Content-Type — el browser lo setea con boundary automáticamente
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.token}`,
      ...options.headers,
    };
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
      signal: options.signal,
    });
    return this.handleResponse<T>(response);
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Crea un cliente API tipado con el token provisto.
 * El token DEBE venir de AuthContext u otra fuente en memoria — nunca de storage.
 *
 * @param token           JWT token en memoria
 * @param onUnauthorized  Callback a ejecutar cuando el servidor devuelve 401
 */
export function createApi(
  token: string,
  onUnauthorized?: OnUnauthorizedCallback,
): ApiClient {
  return new ApiClient(token, onUnauthorized);
}
