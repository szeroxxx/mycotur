import { useState, useCallback } from "react";
import { Agent } from "../types/agent";
import axios from "axios";
import { getSession } from "next-auth/react";

const URL = process.env.NEXTAUTH_BACKEND_URL;

interface Toast {
  type: "success" | "error";
  message: string;
}

interface CategoryData {
  uuid: string;
  title: string;
  description: string;
}

interface LocationData {
  uuid: string;
  location: string;
}

interface ProfileData {
  profilePicture: string;
  name: string;
  email: string;
  about: string;
  address: string;
  social: {
    facebook: string;
    instagram: string;
    youtube: string;
  };
  categories: Array<string>;
}

interface ProfileCompletion {
  needsUpdate: boolean;
  fields: string[];
  message: string;
}

interface UseProfileReturn {
  updateProfile: (data: Partial<Agent>) => Promise<void>;
  changePassword: (
    currentPassword: string,
    newPassword: string
  ) => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  fetchProfile: () => Promise<ProfileData>;
  checkProfileCompletion: () => Promise<ProfileCompletion>;
  fetchCategories: () => Promise<CategoryData[]>;
  fetchCategoriesActivity: () => Promise<CategoryData[]>;
  fetchLocations: () => Promise<LocationData[]>;
  toast: Toast | null;
}

export const useProfile = (): UseProfileReturn => {
  const [toast, setToast] = useState<Toast | null>(null);
  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchProfile = useCallback(async (): Promise<ProfileData> => {
    try {
      const session = await getSession();
      if (!session?.user?.uuid) {
        throw new Error("User session not found");
      }

      const response = await axios.get(`${URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data && response.data.data) {
        return response.data.data;
      }
      throw new Error("Profile data not found");
    } catch (error) {
      console.error("Error fetching profile:", error);
      showToast("error", "Failed to fetch profile data");
      throw error;
    }
  }, [showToast]);

  const updateProfile = async (data: Partial<Agent>) => {
    try {
      const updateData = {
        name: data.name,
        about: data.about,
        address: data.address,
        facebook: data.social?.facebook,
        instagram: data.social?.instagram,
        youtube: data.social?.youtube,
        categories: data.categories || [],
      };

      const uuid = localStorage.getItem("userUuid");
      if (!uuid) {
        throw new Error("User ID not found");
      }

      const session = await getSession();
      if (!session?.user?.accessToken) {
        throw new Error("User session not found");
      }

      console.log("updateData::: ", updateData);
      const response = await axios.put(`${URL}/api/user/${uuid}`, updateData, {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data && response.data.message === "User updated") {
        showToast("success", "Profile updated successfully");
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update profile";
      showToast("error", message);
      throw err;
    }
  };
  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      const session = await getSession();
      if (!session?.user?.uuid || !session?.user?.accessToken) {
        throw new Error("User session not found");
      }
      const config = {
        method: "put",
        url: `${URL}/api/user/reset-password/${session.user.uuid}`,
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
          "Content-Type": "application/json",
        },
        data: {
          password: newPassword,
          password1: newPassword,
        },
      };

      const response = await axios.request(config);
      if (response.status === 200) {
        showToast("success", "Password changed successfully");
      } else {
        throw new Error("Failed to change password");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to change password";
      showToast("error", message);
      throw err;
    }
  };
  const requestPasswordReset = async (email: string) => {
    try {
      const session = await getSession();
      if (!session?.user?.uuid || !session?.user?.accessToken) {
        throw new Error("User session not found");
      }

      const response = await axios.post(
        `${URL}/api/forgot-password/${session.user.uuid}`,
        { email },
        {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200) {
        showToast("success", "Password reset instructions sent to your email");
      } else {
        throw new Error("Failed to process password reset request");
      }
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Failed to process password reset request";
      showToast("error", message);
      throw err;
    }
  };
  const checkProfileCompletion = useCallback(async () => {
    try {
      const session = await getSession();
      if (!session?.user?.uuid) {
        showToast("error", "User session not found");
        return;
      }

      const uuid = localStorage.getItem("userUuid");
      const response = await axios.get(`${URL}/api/profile/completion-status`, {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
          "Content-Type": "application/json",
          userid: uuid,
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error checking profile completion:", error);
      showToast("error", "Failed to check profile completion status");
    }
  }, [showToast]);

  const fetchCategories = useCallback(async (): Promise<CategoryData[]> => {
    try {
      const response = await axios.get(`${URL}/api/category`);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      showToast("error", "Failed to fetch categories");
      throw error;
    }
  }, [showToast]);

  const fetchCategoriesActivity = useCallback(async () => {
    try {
      const session = await getSession();
      if (!session?.user?.uuid) {
        showToast("error", "User session not found");
        return;
      }
      const uuid = localStorage.getItem("userUuid");
      const response = await axios.get(`${URL}/api/categories-drop`, {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
          "Content-Type": "application/json",
          userid: uuid,
        },
      });
      console.log('responxxxxse::: ', response);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      showToast("error", "Failed to fetch categories");
      throw error;
    }
  }, [showToast]);

  const fetchLocations = useCallback(async (): Promise<LocationData[]> => {
    try {
      const response = await axios.get(`${URL}/api/getLocation`);
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching locations:", error);
      showToast("error", "Failed to fetch locations");
      throw error;
    }
  }, [showToast]);

  return {
    updateProfile,
    changePassword,
    requestPasswordReset,
    fetchProfile,
    checkProfileCompletion,
    fetchCategories,
    fetchCategoriesActivity,
    fetchLocations,
    toast,
  };
};
