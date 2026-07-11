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

type ApiRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is ApiRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getErrorMessageFromData = (data: unknown) => {
  if (isRecord(data) && "message" in data) {
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

export const getFieldErrors = (error: unknown): Record<string, string> => {
  if (!(error instanceof ApiError) || !isRecord(error.data)) {
    return {};
  }

  const { errors } = error.data;

  if (!isRecord(errors)) {
    return {};
  }

  return Object.entries(errors).reduce<Record<string, string>>(
    (fieldErrors, [field, message]) => {
      if (typeof message === "string" && message.trim() !== "") {
        fieldErrors[field] = message;
      }

      if (Array.isArray(message) && typeof message[0] === "string") {
        fieldErrors[field] = message[0];
      }

      return fieldErrors;
    },
    {}
  );
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
    const requestUrl  = `${API_BASE_URL}${normalizedPath}`;
    response = await fetch(requestUrl , {
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
