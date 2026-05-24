import { API_BASE_URL } from "./api";
import { getToken } from "./tokenStorage";

export class ApiError extends Error {
  status: number;
  data: unknown;

  constructor(message: string, status: number, data: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

interface ApiClientOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

const getErrorMessageFromData = (data: unknown) => {
  if (typeof data === "object" && data !== null && "message" in data) {
    const message = data.message;

    if (typeof message === "string") {
      return message;
    }
  }

  if (typeof data === "string" && data.trim() !== "") {
    return data;
  }

  return "Ocurrió un error inesperado";
};

export const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Ocurrió un error inesperado";
};

export const apiClient = async <T>(
  path: string,
  options: ApiClientOptions = {}
): Promise<T> => {
  if (!API_BASE_URL) {
    throw new ApiError(
      "VITE_API_URL no está configurada",
      500,
      null
    );
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const token = getToken();
  const headers = new Headers(options.headers);

  headers.set("Accept", "application/json");

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
      ...options,
      headers,
      body:
        options.body === undefined
          ? undefined
          : JSON.stringify(options.body),
    });
  } catch (error) {
    console.error("Error de red en apiClient:", error);

    throw new ApiError(
      "No se pudo conectar con el servidor",
      0,
      null
    );
  }

  const contentType = response.headers.get("content-type") ?? "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw new ApiError(
      getErrorMessageFromData(data),
      response.status,
      data
    );
  }

  return data as T;
};