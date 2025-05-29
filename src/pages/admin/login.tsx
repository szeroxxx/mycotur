import React, { useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "next-auth/react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Image from "next/image";

const AdminLogin: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    console.log("handleSubmit::: ");
    e.preventDefault();
    console.log("xx::: ");
    setIsLoading(true);
    console.log("xx::: ");

    setError("");
    console.log("xx::: ");
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        role: "admin",
      });

      console.log("result::: ", result);
      if (result?.error) {
        setError(result.error);
        return;
      }
      if (result?.ok) {
        const session = await fetch("/api/auth/session");
        const sessionData = await session.json();

        if (sessionData?.user?.uuid) {
          console.log("Storing UUID in localStorage:", sessionData.user.uuid);
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
      setError("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[rgba(255,255,255)] flex">
      <div className="flex w-full">
        <div className="w-full lg:w-5/12 xl:w-4/12 flex items-center justify-center p-10">
          <div className="w-full max-w-md bg-[rgba(255,255,255)] rounded-lg border border-gray-200 shadow-md p-8">
            <h2 className="text-xl font-semibold text-center text-[rgb(68,63,63)] mb-6">
              Admin Log in
            </h2>

            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-800 rounded-md text-center text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[rgb(68,63,63)] mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@cotur.com"
                  className="w-full p-2.5 text-[rgb(142,133,129)] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-400"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[rgb(68,63,63)] mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
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
              <button
                type="submit"
                className="w-full bg-[rgb(194,91,52)] hover:bg-[rgb(174,81,42)] text-white font-medium py-2.5 px-4 rounded transition-colors"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Log in"}
              </button>
            </form>
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
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
