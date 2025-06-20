import React, { useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { FiEye, FiEyeOff, FiX } from "react-icons/fi";
import Image from "next/image";
import { usePublicPasswordReset } from "@/hooks/usePublicPasswordReset";

const AdminLogin: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const {
    requestPasswordReset,
    toast,
    isLoading: isResetLoading,
  } = usePublicPasswordReset();

  const handleInvalidInput = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.currentTarget;
    if (target.validity.valueMissing) {
      target.setCustomValidity("Este campo es obligatorio");
    } else {
      target.setCustomValidity("");
    }
  };

  const handleInputChange = (e: React.FormEvent<HTMLInputElement>) => {
    e.currentTarget.setCustomValidity("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        role: "admin",
      });

      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.ok) {
        const session = await fetch("/api/auth/session");
        const sessionData = await session.json();

        if (sessionData?.user?.uuid) {
          localStorage.setItem("userUuid", sessionData.user.uuid);
        } else {
          console.warn("UUID not found in session data");
        }
        router.replace("/dashboard");
        return;
      }
    } catch (err) {
      console.error(
        "Login error:",
        err instanceof Error ? err.message : "Unknown error"
      );
      setError("Ocurrió un error. Inténtalo de nuevo más tarde.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await requestPasswordReset(forgotPasswordEmail);
    if (success) {
      setIsForgotPasswordOpen(false);
      setForgotPasswordEmail("");
    }
  };

  return (
    <div className="min-h-screen bg-[rgba(255,255,255)] flex">
      <div className="flex w-full">
        <div className="w-full lg:w-5/12 xl:w-4/12 flex items-center justify-center p-10">
          <div className="w-full max-w-md bg-[rgba(255,255,255)] rounded-lg border border-gray-200 shadow-md p-8">
            <h2 className="text-xl font-semibold text-center text-[rgb(68,63,63)] mb-6">
              Acceso para administradores
            </h2>{" "}
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-800 rounded-md text-center text-sm">
                {error}
              </div>
            )}
            {toast && (
              <div
                className={`mb-4 p-2 ${
                  toast.type === "success"
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                } rounded-md text-center text-sm`}
              >
                {toast.message}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[rgb(68,63,63)] mb-1"
                >
                  Correo electrónico
                </label>{" "}
                <input
                  id="email"
                  type="email"
                  placeholder="tu@ejemplo.com"
                  className="w-full p-2.5 text-[rgb(142,133,129)] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onInvalid={handleInvalidInput}
                  onInput={handleInputChange}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[rgb(68,63,63)] mb-1"
                >
                  Contraseña
                </label>
                <div className="relative">
                  {" "}
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full p-2.5 text-[rgb(142,133,129)] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onInvalid={handleInvalidInput}
                    onInput={handleInputChange}
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
              </div>{" "}
              <button
                type="submit"
                className="w-full bg-[rgb(194,91,52)] hover:bg-[rgb(174,81,42)] text-white font-medium py-2.5 px-4 rounded transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
              </button>
            </form>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsForgotPasswordOpen(true)}
                className="text-[rgb(194,91,52)] hover:text-[rgb(174,81,42)] text-sm font-medium transition-colors"
              >
                ¿Has olvidado tu contraseña?
              </button>
            </div>
          </div>
        </div>

        <div className="hidden lg:block lg:w-7/12 xl:w-8/12 relative ">
          <div className="absolute inset-0  overflow-hidden p-3">
            <Image
              src="/back1.jpeg"
              alt="Decorative mushroom background"
              fill
              className="object-cover rounded-[24px]"
              priority
            />{" "}
          </div>
        </div>
      </div>

      {isForgotPasswordOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-none flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            {" "}
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-[rgb(68,63,63)]">
                Restablecer contraseña
              </h2>
              <button
                onClick={() => setIsForgotPasswordOpen(false)}
                className="text-[rgba(100,92,90)] hover:text-[#111827] p-1"
              >
                <FiX size={20} />
              </button>
            </div>
            <p className="text-sm text-[rgb(68,63,63)] mb-6">
              Introduce tu dirección de correo electrónico y te enviaremos las
              instrucciones para restablecer tu contraseña.
            </p>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(68,63,63)] mb-1">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  className="w-full p-2 text-[rgb(68,63,63)] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[rgb(194,91,52)]"
                  placeholder="tu@ejemplo.com"
                  onInvalid={handleInvalidInput}
                  onInput={handleInputChange}
                  required
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 text-[rgb(68,63,63)] border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors order-2 sm:order-1"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isResetLoading}
                  className="w-full sm:w-auto px-4 py-2 bg-[rgb(194,91,52)] hover:bg-[rgb(174,81,42)] text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 order-1 sm:order-2"
                >
                  {isResetLoading ? "Enviando..." : "Enviar enlace"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLogin;
