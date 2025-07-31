import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
import axiosInstance from "../../utils/axiosConfig";
import Image from "next/image";
import { FiEye, FiEyeOff } from "react-icons/fi";

interface UserData {
  id: number;
  uuid: string;
  name: string;
  email: string;
  role: string;
  status: string;
  invitedBy: string;
  createdAt: string;
  updatedAt: string;
}

const RegisterPage: React.FC = () => {
  const router = useRouter();
  const { uuid } = router.query;
  const [userData, setUserData] = useState<UserData | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const URL = process.env.NEXTAUTH_BACKEND_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!uuid) return;

      try {
        const response = await axiosInstance.get(
          `${URL}/api/user-info/${uuid}`
        );
        setUserData(response.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 400) {
            setError("Usuario no encontrado");
          } else if (err.response?.status === 410) {
            // Handle expired link
            const errorMessage =
              err.response?.data?.error ||
              "Este enlace de invitación ha expirado";
            setError(errorMessage);
          } else {
            console.error("Error fetching user data:", err);
            setError(
              "Error al cargar la información del usuario. Por favor, inténtalo de nuevo."
            );
          }
        } else {
          console.error("Error fetching user data:", err);
          setError(
            "Error al cargar la información del usuario. Por favor, inténtalo de nuevo."
          );
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [uuid, URL]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (!userData) {
      setError(
        "Datos de usuario no disponibles. Por favor, recarga la página."
      );
      return;
    }
    try {
      const response = await axiosInstance.put(
        `${URL}/api/reset-password/${uuid}`,
        {
          password: password,
          password1: password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.message === "Password reset successfully") {
        router.push("/login?registered=true");
      }
    } catch (err) {
      console.error("Error resetting password:", err);
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 410) {
          setError("Este enlace ya ha sido utilizado anteriormente.");
        } else if (err.response?.status === 400) {
          setError("Enlace de restablecimiento inválido o expirado.");
        } else {
          setError(
            "Error al restablecer la contraseña. Por favor, inténtalo de nuevo."
          );
        }
      } else {
        setError(
          "Error al restablecer la contraseña. Por favor, inténtalo de nuevo."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[rgba(255,255,255)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(194,91,52)] mx-auto mb-4"></div>
          <p className="text-[rgb(68,63,63)]">Cargando...</p>
        </div>
      </div>
    );
  }

  const isExpiredLink =
    error.includes("expirado") ||
    error.includes("expired") ||
    error.includes("utilizado");

  if (error && isExpiredLink) {
    return (
      <div className="min-h-screen bg-[rgba(255,255,255)] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[rgba(255,255,255)] rounded-lg border border-gray-200 shadow-md p-8 text-center">
          <div className="text-yellow-500 text-6xl mb-6">⚠️</div>
          <h2 className="text-xl font-semibold text-[rgb(68,63,63)] mb-4">
            Enlace Expirado
          </h2>
          <p className="text-[rgb(142,133,129)] mb-6 text-sm leading-relaxed">
            {error.includes("utilizado")
              ? "Este enlace de invitación ya ha sido utilizado. Si ya tienes una cuenta, puedes iniciar sesión."
              : "Este enlace de invitación ha expirado. Si ya tienes una cuenta, puedes iniciar sesión."}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-[rgb(194,91,52)] hover:bg-[rgb(174,81,42)] text-white font-medium py-2.5 px-4 rounded transition-colors"
            >
              Ir a Iniciar Sesión
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full border border-[rgb(194,91,52)] text-[rgb(194,91,52)] hover:bg-[rgb(194,91,52)] hover:text-white font-medium py-2.5 px-4 rounded transition-colors"
            >
              Volver al Inicio
            </button>
          </div>
          <div className="mt-6 text-xs text-[rgb(142,133,129)]">
            Si necesitas ayuda, contacta al administrador.
          </div>
        </div>
      </div>
    );
  }

  if (error && !isExpiredLink) {
    return (
      <div className="min-h-screen bg-[rgba(255,255,255)] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-[rgba(255,255,255)] rounded-lg border border-gray-200 shadow-md p-8 text-center">
          <div className="text-red-500 text-6xl mb-6">❌</div>
          <h2 className="text-xl font-semibold text-[rgb(68,63,63)] mb-4">
            Error
          </h2>
          <p className="text-[rgb(142,133,129)] mb-6 text-sm leading-relaxed">
            {error}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-[rgb(194,91,52)] hover:bg-[rgb(174,81,42)] text-white font-medium py-2.5 px-4 rounded transition-colors"
            >
              Reintentar
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full border border-[rgb(194,91,52)] text-[rgb(194,91,52)] hover:bg-[rgb(194,91,52)] hover:text-white font-medium py-2.5 px-4 rounded transition-colors"
            >
              Volver al Inicio
            </button>
          </div>
          <div className="mt-6 text-xs text-[rgb(142,133,129)]">
            Si el problema persiste, contacta al administrador.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgba(255,255,255)] flex">
      <div className="flex w-full">
        <div className="w-full lg:w-5/12 xl:w-4/12 flex items-center justify-center p-10">
          <div className="w-full max-w-md bg-[rgba(255,255,255)] rounded-lg border border-gray-200 shadow-md p-8">
            <h2 className="text-xl font-semibold text-center text-[rgb(68,63,63)] mb-6">
              Crea tu cuenta en Mycotour
            </h2>

            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-800 rounded-md text-center text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[rgb(68,63,63)] mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={userData?.name || ""}
                  className="w-full p-2.5 text-[rgb(142,133,129)] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(68,63,63)] mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={userData?.email || ""}
                  className="w-full p-2.5 text-[rgb(142,133,129)] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                  disabled
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(68,63,63)] mb-1">
                  Crea una contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full p-2.5 text-[rgb(142,133,129)] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[rgb(68,63,63)] mb-1">
                  Confirma tu contraseña
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full p-2.5 text-[rgb(142,133,129)] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <FiEyeOff size={18} />
                    ) : (
                      <FiEye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[rgb(194,91,52)] hover:bg-[rgb(174,81,42)] disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded transition-colors"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creando cuenta...
                  </div>
                ) : (
                  "Crear cuenta"
                )}
              </button>
            </form>
          </div>
        </div>

        <div className="hidden lg:block lg:w-7/12 xl:w-8/12 relative">
          <div className="absolute inset-0 overflow-hidden p-3">
            <Image
              src="/back1.jpeg"
              alt="Decorative mushroom background"
              fill
              className="object-cover rounded-[24px]"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
