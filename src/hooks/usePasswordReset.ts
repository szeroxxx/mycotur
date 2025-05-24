import { useState } from "react";
import axios from "axios";

const URL = process.env.NEXTAUTH_BACKEND_URL;

interface Toast {
  type: "success" | "error";
  message: string;
}

export const usePasswordReset = () => {
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const changePassword = async (oldPassword: string, newPassword: string) => {
    try {
      const token = localStorage.getItem("token");
      const config = {
        method: "post",
        url: `${URL}/api/user/change-password`,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        data: {
          oldPassword,
          newPassword,
        },
      };

      const response = await axios.request(config);
      if (response.status === 200) {
        showToast("success", "Password changed successfully");
      } else {
        throw new Error("Failed to change password");
      }
    } catch (err) {
      showToast("error", "Failed to change password");
      throw err;
    }
  };

  const requestPasswordReset = async (email: string) => {
    try {
      const response = await axios.post(`${URL}/api/user/reset-password`, { email });
      if (response.status === 200) {
        showToast("success", "Password reset link sent to your email");
      } else {
        throw new Error("Failed to send password reset link");
      }
    } catch (err) {
      showToast("error", "Failed to send password reset link");
      throw err;
    }
  };

  return {
    changePassword,
    requestPasswordReset,
    toast,
  };
};
