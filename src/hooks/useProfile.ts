import { useState, useCallback } from "react";
import { Agent } from "../types/agent";
import axiosInstance from "../utils/axiosConfig";
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

interface ProfileData {
  profilePicture: string;
  name: string;
  email: string;
  primaryMail: string;
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
  fetchCategoriesActivity: () => Promise<CategoryData[]>;
  uploadProfileImage: (file: File) => Promise<string>;
  toast: Toast | null;
}

export const useProfile = (): UseProfileReturn => {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback(
    (type: "success" | "error", message: string) => {
      setToast({ type, message });
      setTimeout(() => setToast(null), 3000);
    },
    []
  );

  const fetchProfile = useCallback(async (): Promise<ProfileData> => {
    try {
      const session = await getSession();
      if (!session?.user?.uuid) {
        throw new Error("User session not found");
      }
      const response = await axiosInstance.get(`${URL}/api/profile`, {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
          "Content-Type": "application/json",
        },
      });
      if (response.data && response.data.data) {
        const profileData = response.data.data;
        return {
          profilePicture: profileData.profileImage || "",
          name: profileData.name,
          email: profileData.email,
          primaryMail: profileData.primaryMail || "",
          about: profileData.about || "",
          address: profileData.address || "",
          social: {
            facebook: profileData.social?.facebook || "",
            instagram: profileData.social?.instagram || "",
            youtube: profileData.social?.youtube || "",
          },
          categories: profileData.categories || [],
        };
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
        primaryMail: data.primaryMail,
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
      const response = await axiosInstance.put(
        `${URL}/api/user/${uuid}`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

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
        throw new Error("Sesión de usuario no encontrada");
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

      const response = await axiosInstance.request(config);
      if (response.status === 200) {
        showToast("success", "Contraseña cambiada con éxito");
      } else {
        throw new Error("Fallo al cambiar la contraseña");
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Fallo al cambiar la contraseña";
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
      const response = await axiosInstance.post(
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
        showToast("success", "Instrucciones para restablecer la contraseña enviadas a su correo electrónico");
      } else {
        throw new Error("Fallo al procesar la solicitud de restablecimiento de contraseña");
      }
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Fallo al procesar la solicitud de restablecimiento de contraseña";
      showToast("error", message);
      throw err;
    }
  };
  const checkProfileCompletion = useCallback(async () => {
    try {
      const session = await getSession();
      if (!session?.user?.uuid) {
        showToast("error", "Sesión de usuario no encontrada");
        return;
      }
      const uuid = localStorage.getItem("userUuid");
      const response = await axiosInstance.get(
        `${URL}/api/profile/completion-status`,
        {
          headers: {
            Authorization: `Bearer ${session.user.accessToken}`,
            "Content-Type": "application/json",
            userid: uuid,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error checking profile completion:", error);
      showToast("error", "Fallo al verificar el estado de finalización del perfil");
    }
  }, [showToast]);

  const fetchCategoriesActivity = useCallback(async () => {
    try {
      const session = await getSession();
      if (!session?.user?.uuid) {
        showToast("error", "Sesión de usuario no encontrada");
        return;
      }
      const uuid = localStorage.getItem("userUuid");
      const response = await axiosInstance.get(`${URL}/api/categories-drop`, {
        headers: {
          Authorization: `Bearer ${session.user.accessToken}`,
          "Content-Type": "application/json",
          userid: uuid,
        },
      });
      if (response.data && response.data.data) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching categories:", error);
      showToast("error", "Fallo al obtener las categorías");
      throw error;
    }
  }, [showToast]);

  const uploadProfileImage = useCallback(
    async (file: File): Promise<string> => {
      try {
        const session = await getSession();
        if (!session?.user?.accessToken) {
          throw new Error("Sesión de usuario no encontrada");
        }
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/jpg",
        ];
        if (!allowedTypes.includes(file.type)) {
          throw new Error("Solo se permiten imágenes JPG, PNG y WebP");
        }
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
          throw new Error("El tamaño de la imagen debe ser menor a 5MB");
        }
        const formData = new FormData();
        formData.append("profileImage", file);

        const response = await axiosInstance.post(
          `${URL}/api/profile/image`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (
          response.data &&
          response.data.message === "Profile image updated successfully"
        ) {
          showToast("success", "Imagen de perfil actualizada con éxito");
          return response.data.data.profileImage;
        } else {
          throw new Error("Fallo al subir la imagen de perfil");
        }
      } catch (error) {
        console.error("Error uploading profile image:", error);
        const message =
          error instanceof Error
            ? error.message
            : "Fallo al subir la imagen de perfil";
        showToast("error", message);
        throw error;
      }
    },
    [showToast]
  );

  return {
    updateProfile,
    changePassword,
    requestPasswordReset,
    fetchProfile,
    checkProfileCompletion,
    fetchCategoriesActivity,
    uploadProfileImage,
    toast,
  };
};
