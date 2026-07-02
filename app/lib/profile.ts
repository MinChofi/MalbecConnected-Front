export interface BusinessProfile {
  fantasyName: string;
  address: string;
  phone: string;
  contactEmail: string;
}

const BUSINESS_PROFILE_KEY = "malbec_connected_business_profile";

const emptyProfile: BusinessProfile = {
  fantasyName: "",
  address: "",
  phone: "",
  contactEmail: "",
};

type ProfileRecord = Partial<Record<keyof BusinessProfile, unknown>>;

const canUseStorage = () => typeof window !== "undefined";

const isProfileRecord = (value: unknown): value is ProfileRecord =>
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
