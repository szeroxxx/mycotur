import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { FiUser, FiMail, FiMapPin, FiEdit2, FiX } from "react-icons/fi";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import { useProfile } from "@/hooks/useProfile";
import { useData } from "@/contexts/DataContext";
import { getMediaUrl } from "@/utils/mediaHelpers";
import { CircleCheck } from "lucide-react";
interface Category {
  uuid: string;
  title: string;
  description: string;
}

interface SocialErrors {
  facebook?: string;
  instagram?: string;
  youtube?: string;
}

import { GetServerSideProps } from "next";
import { getSession as getServerSession } from "next-auth/react";

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context);

  if (!session) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {
      session,
    },
  };
};

const ProfilePage: React.FC = () => {
  const { data: session } = useSession();
  const {
    updateProfile,
    changePassword,
    requestPasswordReset,
    fetchProfile,
    uploadProfileImage,
    toast,
  } = useProfile();
  const { categories } = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    profilePicture: "",
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    primaryMail: "",
    about: "",
    address: "",
    social: {
      facebook: "",
      instagram: "",
      youtube: "",
    },
    categories: [] as string[],
  });
  const loadProfile = async () => {
    try {
      const profileData = await fetchProfile();
      console.log("profileData::: ", profileData);
      const loadedData = {
        profilePicture: profileData.profilePicture || "",
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
        categories: profileData.categories,
      };

      if (isEditing) {
        const savedFormData = localStorage.getItem("profileFormData");
        if (savedFormData) {
          try {
            const parsedData = JSON.parse(savedFormData);
            setProfileData(parsedData);
            return;
          } catch (e) {
            console.error("Error parsing saved form data:", e);
            localStorage.removeItem("profileFormData");
          }
        }
      }

      setProfileData(loadedData);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };
  useEffect(() => {
    if (typeof window !== "undefined") {
      const wasEditing = sessionStorage.getItem("isEditingProfile");
      if (wasEditing === "true") {
        setIsEditing(true);
      }
    }
  }, []);

  useEffect(() => {
    if (session?.user) {
      loadProfile();
    }
  }, [session?.user, isEditing]);

  useEffect(() => {
    if (isEditing && profileData.name) {
      localStorage.setItem("profileFormData", JSON.stringify(profileData));
      sessionStorage.setItem("isEditingProfile", "true");
    }
  }, [profileData, isEditing]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (isEditing) {
        localStorage.setItem("profileFormData", JSON.stringify(profileData));
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden && isEditing) {
        localStorage.setItem("profileFormData", JSON.stringify(profileData));
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [isEditing, profileData]);
  // Clear saved form data after successful save
  const handleSave = async () => {
    try {
      if (!validateSocialInputs()) {
        return;
      }
      await updateProfile({
        name: profileData.name,
        primaryMail: profileData.primaryMail,
        about: profileData.about,
        address: profileData.address,
        social: profileData.social,
        categories: profileData.categories as string[],
      });
      setIsEditing(false);
      localStorage.removeItem("profileFormData");
      sessionStorage.removeItem("isEditingProfile");
    } catch (err) {
      console.error(
        "Failed to update profile:",
        err instanceof Error ? err.message : "Unknown error"
      );
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    localStorage.removeItem("profileFormData");
    sessionStorage.removeItem("isEditingProfile");
    if (session?.user) {
      fetchProfile().then((profileData) => {
        setProfileData({
          profilePicture: profileData.profilePicture || "",
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
          categories: profileData.categories,
        });
      });
    }
  };

  const handleEditToggle = () => {
    setIsEditing(true);
  };

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const [socialErrors, setSocialErrors] = useState<SocialErrors>({});
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const validatePassword = () => {
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters long");
      return false;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return false;
    }
    setPasswordError("");
    return true;
  };
  const validateSocialInputs = () => {
    const errors: SocialErrors = {};
    let isValid = true;

    Object.entries(profileData.social).forEach(([platform, url]) => {
      if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
        errors[
          platform as keyof SocialErrors
        ] = `Please enter a valid URL starting with http:// or https://`;
        isValid = false;
      }
    });

    setSocialErrors(errors);
    return isValid;
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (!validatePassword()) {
      return;
    }

    try {
      await changePassword(currentPassword, newPassword);
      setIsChangePasswordOpen(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.log("err::: ", err);
      setPasswordError(
        "Failed to change password. Please check your current password."
      );
    }
  };

  const handleForgotPassword = async () => {
    try {
      await requestPasswordReset(profileData.email);
      setIsForgotPasswordOpen(false);
    } catch (err) {
      console.error(
        "Failed to request password reset:",
        err instanceof Error ? err.message : "Unknown error"
      );
    }
  };
  const toggleCategory = (category: Category) => {
    const exists = profileData.categories.includes(category.uuid);

    if (exists) {
      setProfileData((prev) => ({
        ...prev,
        categories: prev.categories.filter((uuid) => uuid !== category.uuid),
      }));
    } else {
      setProfileData((prev) => ({
        ...prev,
        categories: [...new Set([...prev.categories, category.uuid])],
      }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    setUploadError(null);

    try {
      const profileImagePath = await uploadProfileImage(file);
      setProfileData((prev) => ({
        ...prev,
        profilePicture: profileImagePath,
      }));
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload image"
      );
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  return (
    <>
      <Head>
        <title>My Profile | Mycotur</title>
      </Head>
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-[12px] text-[rgba(255,255,255)] ${
            toast.type === "success"
              ? "bg-[rgba(22,163,74)]"
              : "bg-[rgba(179,38,30)]"
          } flex items-center`}
        >
          <CircleCheck className="mr-2" />
          <span>{toast.message}</span>
        </div>
      )}{" "}
      <div className="max-w-3xl mx-auto p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <h1 className="text-xl sm:text-2xl font-semibold text-[rgb(68,63,63)]">
            My Profile
          </h1>{" "}
          {!isEditing ? (
            <button
              onClick={handleEditToggle}
              className="self-start sm:self-auto text-[rgba(68,63,63)] hover:text-[#D45B20] transition-colors"
            >
              <FiEdit2 size={20} />
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-[rgba(68,63,63)] hover:text-[#111827] font-medium text-center"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#D45B20] hover:bg-[#C44D16] text-white rounded-lg text-sm font-medium transition-colors"
              >
                Save
              </button>
            </div>
          )}
        </div>{" "}
        <div className="bg-white rounded-lg shadow-md">
          <div className="p-4 sm:p-6 space-y-6">
            <div className="flex flex-col items-center space-y-4 pb-6 border-b border-[rgba(226,225,223)]">
              <div className="relative group">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-[rgba(226,225,223)] bg-[rgba(253,250,246)] shadow-lg">
                  {profileData.profilePicture ? (
                    <img
                      src={getMediaUrl(profileData.profilePicture)}
                      alt="Profile"
                      className="w-full h-full object-cover transition-opacity group-hover:opacity-90"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiUser
                        size={36}
                        className="sm:size-12 text-[rgba(194,91,52)]"
                      />
                    </div>
                  )}
                </div>
                <button
                  onClick={() =>
                    document.getElementById("profile-image-input")?.click()
                  }
                  disabled={isUploadingImage}
                  className="absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-8 h-8 sm:w-10 sm:h-10 bg-[#D45B20] hover:bg-[#C44D16] text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                  title="Change profile picture"
                >
                  {isUploadingImage ? (
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <FiEdit2 size={14} className="sm:text-lg" />
                  )}
                </button>
                <input
                  id="profile-image-input"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              <div className="text-center">
                <p className="text-sm text-[rgba(100,92,90)] mb-1">
                  Profile Picture
                </p>
                <p className="text-xs text-[rgba(100,92,90)]">
                  Click the edit button to upload a new image
                </p>
                <p className="text-xs text-[rgba(100,92,90)]">
                  Supported: JPG, PNG, WebP (max 5MB)
                </p>
              </div>
              {uploadError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 max-w-sm">
                  <p className="text-red-600 text-sm text-center">
                    {uploadError}
                  </p>
                </div>
              )}
            </div>{" "}
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 bg-[rgba(253,250,246)] rounded-lg">
                <div className="p-3 bg-[rgba(255,255,255)] rounded-full border border-[rgba(226,225,223)] self-center sm:self-auto">
                  <FiUser
                    size={20}
                    className="sm:size-6 text-[rgba(194,91,52)]"
                  />
                </div>
                <div className="flex-grow text-center sm:text-left">
                  <p className="text-sm text-[rgba(100,92,90)]">Name</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      required
                      className="w-full p-2 text-[rgb(68,63,63)] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#D45B20] text-sm"
                    />
                  ) : (
                    <p className="text-[rgb(68,63,63)] font-medium">
                      {profileData.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 bg-[rgba(253,250,246)] rounded-lg">
                <div className="p-3 bg-[rgba(255,255,255)] rounded-full border border-[rgba(226,225,223)] self-center sm:self-auto">
                  <FiMail
                    size={20}
                    className="sm:size-6 text-[rgba(194,91,52)]"
                  />
                </div>
                <div className="flex-grow text-center sm:text-left">
                  <p className="text-sm text-[rgba(100,92,90)]">Email</p>
                  <p className="text-[rgb(68,63,63)] font-medium break-all sm:break-normal">
                    {profileData.email}
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 bg-[rgba(253,250,246)] rounded-lg">
                <div className="p-3 bg-[rgba(255,255,255)] rounded-full border border-[rgba(226,225,223)] self-center sm:self-auto">
                  <FiMail
                    size={20}
                    className="sm:size-6 text-[rgba(194,91,52)]"
                  />
                </div>
                <div className="flex-grow text-center sm:text-left">
                  <p className="text-sm text-[rgba(100,92,90)]">Primary Mail</p>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.primaryMail}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          primaryMail: e.target.value,
                        }))
                      }
                      placeholder="Enter your primary email"
                      className="w-full p-2 text-[rgb(68,63,63)] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#D45B20] text-sm"
                    />
                  ) : (
                    <p className="text-[rgb(68,63,63)] font-medium break-all sm:break-normal">
                      {profileData.primaryMail || "Not provided"}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 bg-[rgba(253,250,246)] rounded-lg">
                <div className="p-3 bg-[rgba(255,255,255)] rounded-full border border-[rgba(226,225,223)] self-center sm:self-auto">
                  <FiMapPin
                    size={20}
                    className="sm:size-6 text-[rgba(194,91,52)]"
                  />
                </div>
                <div className="flex-grow text-center sm:text-left">
                  <p className="text-sm text-[rgba(100,92,90)]">Address</p>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.address}
                      onChange={(e) =>
                        setProfileData((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }))
                      }
                      placeholder="Enter your address"
                      className="w-full p-2 text-[rgb(68,63,63)] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#D45B20] text-sm"
                    />
                  ) : (
                    <p className="text-[rgb(68,63,63)] font-medium">
                      {profileData.address || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[rgb(68,63,63)]">
                About us
              </label>
              {isEditing ? (
                <textarea
                  value={profileData.about}
                  onChange={(e) =>
                    setProfileData((prev) => ({
                      ...prev,
                      about: e.target.value,
                    }))
                  }
                  placeholder="Write more about you"
                  rows={4}
                  className="w-full p-2 text-[rgb(68,63,63)] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#D45B20]"
                />
              ) : (
                <p className="text-[rgb(68,63,63)]">
                  {profileData.about || "No description provided"}
                </p>
              )}
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-[rgb(68,63,63)]">
                Social media
              </h3>
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <FaFacebookF size={20} className="text-[rgba(194,91,52)]" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.social.facebook}
                        onChange={(e) => {
                          setProfileData((prev) => ({
                            ...prev,
                            social: {
                              ...prev.social,
                              facebook: e.target.value,
                            },
                          }));
                          setSocialErrors((prev) => ({
                            ...prev,
                            facebook: undefined,
                          }));
                        }}
                        placeholder="https://www.facebook.com"
                        className={`flex-grow p-2 text-[rgb(68,63,63)] border ${
                          socialErrors.facebook
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded focus:outline-none focus:ring-1 focus:ring-[#D45B20]`}
                      />
                    ) : (
                      <a
                        href={profileData.social.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[rgba(100,92,90)] hover:text-[#D45B20]"
                      >
                        {profileData.social.facebook || "Not provided"}
                      </a>
                    )}
                  </div>
                  {socialErrors.facebook && (
                    <p className="text-red-500 text-sm pl-8">
                      {socialErrors.facebook}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <FaInstagram size={20} className="text-[rgba(194,91,52)]" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.social.instagram}
                        onChange={(e) => {
                          setProfileData((prev) => ({
                            ...prev,
                            social: {
                              ...prev.social,
                              instagram: e.target.value,
                            },
                          }));
                          setSocialErrors((prev) => ({
                            ...prev,
                            instagram: undefined,
                          }));
                        }}
                        placeholder="https://www.instagram.com"
                        className={`flex-grow p-2 text-[rgb(68,63,63)] border ${
                          socialErrors.instagram
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded focus:outline-none focus:ring-1 focus:ring-[#D45B20]`}
                      />
                    ) : (
                      <a
                        href={profileData.social.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[rgba(100,92,90)] hover:text-[#D45B20]"
                      >
                        {profileData.social.instagram || "Not provided"}
                      </a>
                    )}
                  </div>
                  {socialErrors.instagram && (
                    <p className="text-red-500 text-sm pl-8">
                      {socialErrors.instagram}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <FaYoutube size={20} className="text-[rgba(194,91,52)]" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={profileData.social.youtube}
                        onChange={(e) => {
                          setProfileData((prev) => ({
                            ...prev,
                            social: { ...prev.social, youtube: e.target.value },
                          }));
                          setSocialErrors((prev) => ({
                            ...prev,
                            youtube: undefined,
                          }));
                        }}
                        placeholder="https://www.youtube.com"
                        className={`flex-grow p-2 text-[rgb(68,63,63)] border ${
                          socialErrors.youtube
                            ? "border-red-500"
                            : "border-gray-300"
                        } rounded focus:outline-none focus:ring-1 focus:ring-[#D45B20]`}
                      />
                    ) : (
                      <a
                        href={profileData.social.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[rgba(100,92,90)] hover:text-[#D45B20]"
                      >
                        {profileData.social.youtube || "Not provided"}
                      </a>
                    )}
                  </div>
                  {socialErrors.youtube && (
                    <p className="text-red-500 text-sm pl-8">
                      {socialErrors.youtube}
                    </p>
                  )}
                </div>
              </div>
            </div>{" "}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-[rgb(68,63,63)]">
                Categories
              </h3>
              <div className="space-y-3">
                {categories.map((category) => {
                  const isSelected = profileData.categories.includes(
                    category.uuid
                  );
                  return (
                    <div
                      key={category.uuid}
                      className={`p-4 bg-[rgba(253,250,246)] rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "border border-[#D45B20]"
                          : "hover:border hover:border-[#D45B20]"
                      }`}
                      onClick={() => isEditing && toggleCategory(category)}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="pt-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() =>
                              isEditing && toggleCategory(category)
                            }
                            disabled={!isEditing}
                            className="w-4 h-4 text-[#D45B20] bg-white border-gray-300 rounded focus:ring-[#D45B20]"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium text-[rgb(68,63,63)]">
                            {category.title}
                          </h4>
                          <p className="text-sm text-[rgba(100,92,90)]">
                            {category.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsChangePasswordOpen(true)}
                className="text-[#D45B20] hover:text-[#C44D16] font-medium"
              >
                Change Password
              </button>
            )}
          </div>
        </div>
      </div>{" "}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-none flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-[rgb(68,63,63)]">
                Change Password
              </h2>
              <button
                onClick={() => setIsChangePasswordOpen(false)}
                className="text-[rgba(100,92,90)] hover:text-[#111827] p-1"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[rgb(68,63,63)] mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-2 text-[rgb(68,63,63)] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#D45B20]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(68,63,63)] mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2 text-[rgb(68,63,63)] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#D45B20]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[rgb(68,63,63)] mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-2 text-[rgb(68,63,63)] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#D45B20]"
                  required
                />
              </div>
              {passwordError && (
                <div className="text-red-500 text-sm mt-2">{passwordError}</div>
              )}{" "}
              <div className="flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-0 pt-4">
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-[#D45B20] hover:text-[#C44D16] text-sm font-medium order-2 sm:order-1"
                >
                  Forgot Password?
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 bg-[#D45B20] hover:bg-[#C44D16] text-white rounded-lg text-sm font-medium transition-colors order-1 sm:order-2"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}{" "}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-none flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-semibold text-[rgb(68,63,63)]">
                Forgot Password?
              </h2>
              <button
                onClick={() => setIsForgotPasswordOpen(false)}
                className="text-[rgba(100,92,90)] hover:text-[#111827] p-1"
              >
                <FiX size={20} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleForgotPassword();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-[rgb(68,63,63)] mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={profileData.email}
                  className="w-full p-2 text-[rgb(68,63,63)] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#D45B20]"
                  disabled
                />
              </div>{" "}
              <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(false)}
                  className="w-full sm:w-auto px-4 py-2 text-[rgba(68,63,63)] hover:text-[#111827] font-medium text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 bg-[#D45B20] hover:bg-[#C44D16] text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePage;
