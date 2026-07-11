import { apiClient } from "./apiClient";

export interface BusinessProfile {
  fantasyName: string;
  address: string;
  phone: string;
  contactEmail: string;
}

const PROFILE_PATH = "/api/profile";
const BUSINESS_PROFILE_KEY = "malbec_connected_business_profile";

const emptyProfile: BusinessProfile = {
  fantasyName: "",
  address: "",
  phone: "",
  contactEmail: "",
};

type ProfileRecord = Partial<Record<keyof BusinessProfile, unknown>>;
type ApiRecord = Record<string, unknown>;

const canUseStorage = () => typeof window !== "undefined";

const isProfileRecord = (value: unknown): value is ProfileRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isRecord = (value: unknown): value is ApiRecord =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const getString = (value: unknown) =>
  typeof value === "string" ? value.trim() : "";

const normalizeBusinessProfile = (
  profile: Partial<BusinessProfile> | ProfileRecord
): BusinessProfile => ({
  fantasyName: getString(profile.fantasyName),
  address: getString(profile.address),
  phone: getString(profile.phone),
  contactEmail: getString(profile.contactEmail),
});

const getProfileFromResponse = (response: unknown): BusinessProfile => {
  if (isRecord(response) && isProfileRecord(response.profile)) {
    return normalizeBusinessProfile(response.profile);
  }

  if (isProfileRecord(response)) {
    return normalizeBusinessProfile(response);
  }

  return emptyProfile;
};

export const getBusinessProfile = (): BusinessProfile => {
  if (!canUseStorage()) {
    return emptyProfile;
  }

  const storedProfile = window.localStorage.getItem(BUSINESS_PROFILE_KEY);

  if (!storedProfile) {
    return emptyProfile;
  }

  try {
    const parsedProfile: unknown = JSON.parse(storedProfile);

    if (!isProfileRecord(parsedProfile)) {
      return emptyProfile;
    }

    return normalizeBusinessProfile(parsedProfile);
  } catch {
    return emptyProfile;
  }
};

export const saveBusinessProfile = (profile: BusinessProfile) => {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(
    BUSINESS_PROFILE_KEY,
    JSON.stringify(normalizeBusinessProfile(profile))
  );
};

export const fetchBusinessProfile = async () => {
  const response = await apiClient<unknown>(PROFILE_PATH);
  const profile = getProfileFromResponse(response);

  saveBusinessProfile(profile);

  return profile;
};

export const updateBusinessProfile = async (profile: BusinessProfile) => {
  const normalizedProfile = normalizeBusinessProfile(profile);
  const response = await apiClient<unknown>(PROFILE_PATH, {
    method: "PUT",
    body: normalizedProfile,
  });
  const updatedProfile = getProfileFromResponse(response);

  saveBusinessProfile(updatedProfile);

  return updatedProfile;
};
