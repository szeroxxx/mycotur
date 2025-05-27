import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import axios from "axios";
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
  const [error, setError] = useState("");
  const URL = process.env.NEXTAUTH_BACKEND_URL;

  useEffect(() => {
    const fetchUserData = async () => {
      if (!uuid) return;
      try {
        const response = await axios.get(`${URL}/api/user-info/${uuid}`);
        setUserData(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 400) {
          setError("User not found");
        } else {
          console.error("Error fetching user data:", err);
          setError("Failed to load user information. Please try again.");
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
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    try {
      const response = await axios.put(
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
        router.push("/login");
      }
    } catch (err) {
      console.error("Error resetting password:", err);
      setError("Failed to reset password. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[rgba(255,255,255)] flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[rgba(255,255,255)] flex">
      <div className="flex w-full">
        <div className="w-full lg:w-5/12 xl:w-4/12 flex items-center justify-center p-10">
          <div className="w-full max-w-md bg-[rgba(255,255,255)] rounded-lg border border-gray-200 shadow-md p-8">
            <h2 className="text-xl font-semibold text-center text-[rgb(68,63,63)] mb-6">
              Welcome to Mycotur
            </h2>

            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-800 rounded-md text-center text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-[rgb(68,63,63)] mb-1">
                  Name
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
                  Email
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
                  Set Password
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
                  Re-enter Password
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
                className="w-full bg-[rgb(194,91,52)] hover:bg-[rgb(174,81,42)] text-white font-medium py-2.5 px-4 rounded transition-colors"
              >
                Create Account
              </button>
            </form>
          </div>
        </div>

        <div className="hidden lg:block lg:w-7/12 xl:w-8/12 relative">
          <div className="absolute inset-0 overflow-hidden p-3">
            <Image
              src="/back.png"
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
