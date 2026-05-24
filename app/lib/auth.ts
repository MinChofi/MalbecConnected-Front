import { ApiError, apiClient } from "./apiClient";
import {
  getToken,
  removeToken,
  saveToken,
} from "./tokenStorage";

export interface AuthUser {
  _id?: string;
  id?: string;
  username: string;
  createdAt?: string;
  updatedAt?: string;
}

interface CurrentUserResponse {
  user: AuthUser;
}

export { getToken, removeToken, saveToken };

export const getCurrentUser = async () => {
  const response = await apiClient<CurrentUserResponse>("/auth/me");
  return response.user;
};

export const getStoredUser = async () => {
  if (!getToken()) {
    return null;
  }

  try {
    return await getCurrentUser();
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      removeToken();
      return null;
    }

    throw error;
  }
};