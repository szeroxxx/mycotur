import { useState } from "react";
import axios from "axios";

const URL = process.env.NEXTAUTH_BACKEND_URL;

interface Toast {
  type: "success" | "error";
  message: string;
}

export const usePublicPasswordReset = () => {
  const [toast, setToast] = useState<Toast | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  const requestPasswordReset = async (email: string) => {
    try {
      setIsLoading(true);
      const response = await axios.post(`${URL}/api/public/forgot-password`, { email });
      if (response.status === 200) {
        showToast("success", "Enlace para restablecer la contraseña enviado a tu correo electrónico");
        return true;
      } else {
        throw new Error("Fallo al enviar el enlace de restablecimiento de contraseña");
      }
    } catch (err) {
      console.log('err::: ', err);
      showToast("error", "Fallo al enviar el enlace de restablecimiento de contraseña");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    requestPasswordReset,
    toast,
    isLoading,
  };
};
