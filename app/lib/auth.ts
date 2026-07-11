import { ApiError, apiClient } from "./apiClient";
import {
  getToken,
  removeToken,
  saveToken,
} from "./tokenStorage";
import type { BusinessProfile } from "./profile";

const USER_KEY = "malbecconnected_user";
export const SESSION_CHANGE_EVENT = "malbecconnected_session_change";

const canUseStorage = () => typeof window !== "undefined";

const notifySessionChange = () => {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(SESSION_CHANGE_EVENT));
};

export interface AuthUser {
  _id?: string;
  id?: string;
  username: string;
  profile?: BusinessProfile;
  createdAt?: string;
  updatedAt?: string;
}

interface CurrentUserResponse {
  user: AuthUser;
}

export { getToken, removeToken, saveToken };

const saveCachedUser = (user: AuthUser) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
};

const removeCachedUser = () => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(USER_KEY);
};

export const getCachedUser = () => {
  if (!canUseStorage()) {
    return null;
  }

  const storedUser = window.localStorage.getItem(USER_KEY);

  if (!storedUser) {
    return null;
  }

  try {
    const parsedUser: unknown = JSON.parse(storedUser);

    if (
      typeof parsedUser === "object" &&
      parsedUser !== null &&
      "username" in parsedUser &&
      typeof parsedUser.username === "string"
    ) {
      return parsedUser as AuthUser;
    }
  } catch (error) {
    console.error("Error leyendo usuario guardado:", error);
  }

  removeCachedUser();
  return null;
};

export const setSession = (token: string, user?: AuthUser) => {
  saveToken(token);

  if (user) {
    saveCachedUser(user);
  } else {
    removeCachedUser();
  }

  notifySessionChange();
};

export const clearSession = () => {
  removeToken();
  removeCachedUser();
  notifySessionChange();
};

export const getCurrentUser = async () => {
  const response = await apiClient<CurrentUserResponse>("/auth/me");
  return response.user;
};

export const getStoredUser = async () => {
  if (!getToken()) {
    removeCachedUser();
    return null;
  }

  try {
    const currentUser = await getCurrentUser();

    saveCachedUser(currentUser);

    return currentUser;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      clearSession();
      return null;
    }

    throw error;
  }
};
