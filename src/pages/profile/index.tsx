import React, { useState } from "react";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { FiUser, FiMail, FiMapPin, FiEdit2, FiX } from "react-icons/fi";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import { useProfile } from "@/hooks/useProfile";

interface Category {
  title: string;
  description: string;
}

interface SocialErrors {
  facebook?: string;
  instagram?: string;
  youtube?: string;
}

const ProfilePage: React.FC = () => {
  const { data: session } = useSession();
  const {
    updateProfile,
    changePassword,
    requestPasswordReset,
    validateSocialUrl,
    toast,
  } = useProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

  const [profileData, setProfileData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
    about: "",
    address: "",
    social: {
      facebook: "",
      instagram: "",
      youtube: "",
    },
    categories: [] as Category[],
  });

  const [newCategory, setNewCategory] = useState<Category>({
    title: "",
    description: "",
  });

  // Password states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Add validation states
  const [passwordError, setPasswordError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [socialErrors, setSocialErrors] = useState<SocialErrors>({});

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
      if (url && !validateSocialUrl(url)) {
        errors[platform as keyof SocialErrors] = `Invalid ${platform} URL`;
        isValid = false;
      }
    });

    setSocialErrors(errors);
    return isValid;
  };

  const handleSave = async () => {
    try {
      if (!profileData.name.trim()) {
        throw new Error("Name is required");
      }

      if (!validateSocialInputs()) {
        return;
      }

      await updateProfile({
        name: profileData.name,
        about: profileData.about,
        address: profileData.address,
        social: profileData.social,
        categories: profileData.categories,
      });
      setIsEditing(false);
    } catch (err) {
      console.error(
        "Failed to update profile:",
        err instanceof Error ? err.message : "Unknown error"
      );
    }
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
      console.log('err::: ', err);
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

  const addCategory = () => {
    setCategoryError("");

    if (!newCategory.title.trim()) {
      setCategoryError("Category title is required");
      return;
    }
    if (!newCategory.description.trim()) {
      setCategoryError("Category description is required");
      return;
    }

    setProfileData((prev) => ({
      ...prev,
      categories: [...prev.categories, newCategory],
    }));
    setNewCategory({ title: "", description: "" });
  };

  const removeCategory = (index: number) => {
    setProfileData((prev) => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index),
    }));
  };

  return (
    <>
      <Head>
        <title>My Profile | Mycotur</title>
      </Head>

      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-white ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-[rgb(68,63,63)]">
            My Profile
          </h1>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="text-[rgba(68,63,63)] hover:text-[#D45B20] transition-colors"
            >
              <FiEdit2 size={20} />
            </button>
          ) : (
            <div className="space-x-4">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-[rgba(68,63,63)] hover:text-[#111827] font-medium"
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
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="p-6 space-y-6">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-[rgba(253,250,246)] rounded-lg">
                <div className="p-3 bg-[rgba(255,255,255)] rounded-full border border-[rgba(226,225,223)]">
                  <FiUser size={24} className="text-[rgba(194,91,52)]" />
                </div>
                <div className="flex-grow">
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
                      className="w-full p-2 text-[rgb(68,63,63)] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#D45B20]"
                    />
                  ) : (
                    <p className="text-[rgb(68,63,63)] font-medium">
                      {profileData.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-[rgba(253,250,246)] rounded-lg">
                <div className="p-3 bg-[rgba(255,255,255)] rounded-full border border-[rgba(226,225,223)]">
                  <FiMail size={24} className="text-[rgba(194,91,52)]" />
                </div>
                <div className="flex-grow">
                  <p className="text-sm text-[rgba(100,92,90)]">Email</p>
                  <p className="text-[rgb(68,63,63)] font-medium">
                    {profileData.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-[rgba(253,250,246)] rounded-lg">
                <div className="p-3 bg-[rgba(255,255,255)] rounded-full border border-[rgba(226,225,223)]">
                  <FiMapPin size={24} className="text-[rgba(194,91,52)]" />
                </div>
                <div className="flex-grow">
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
                      className="w-full p-2 text-[rgb(68,63,63)] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#D45B20]"
                    />
                  ) : (
                    <p className="text-[rgb(68,63,63)] font-medium">
                      {profileData.address || "Not provided"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* About Section */}
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

            {/* Social Media Section */}
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
            </div>

            {/* Categories Section */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-[rgb(68,63,63)]">
                Categories
              </h3>
              {isEditing && (
                <div className="space-y-3 p-4 bg-[rgba(253,250,246)] rounded-lg">
                  <input
                    type="text"
                    value={newCategory.title}
                    onChange={(e) =>
                      setNewCategory((prev) => ({
                        ...prev,
                        title: e.target.value,
                      }))
                    }
                    placeholder="Category Title"
                    className="w-full p-2 text-[rgb(68,63,63)] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#D45B20]"
                  />
                  <input
                    type="text"
                    value={newCategory.description}
                    onChange={(e) =>
                      setNewCategory((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Detail about Category"
                    className="w-full p-2 text-[rgb(68,63,63)] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#D45B20]"
                  />
                  {categoryError && (
                    <div className="text-red-500 text-sm mt-2">
                      {categoryError}
                    </div>
                  )}
                  <button
                    onClick={addCategory}
                    className="w-full px-4 py-2 bg-[#D45B20] hover:bg-[#C44D16] text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Add Category
                  </button>
                </div>
              )}

              <div className="space-y-3">
                {profileData.categories.map((category, index) => (
                  <div
                    key={index}
                    className="p-4 bg-[rgba(253,250,246)] rounded-lg"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-[rgb(68,63,63)]">
                          {category.title}
                        </h4>
                        <p className="text-sm text-[rgba(100,92,90)]">
                          {category.description}
                        </p>
                      </div>
                      {isEditing && (
                        <button
                          onClick={() => removeCategory(index)}
                          className="text-[rgba(100,92,90)] hover:text-[#D45B20]"
                        >
                          <FiX size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
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
      </div>

      {/* Change Password Modal */}
      {isChangePasswordOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-none flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[rgb(68,63,63)]">
                Change Password
              </h2>
              <button
                onClick={() => setIsChangePasswordOpen(false)}
                className="text-[rgba(100,92,90)] hover:text-[#111827]"
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
              )}
              <div className="flex justify-between items-center pt-4">
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-[#D45B20] hover:text-[#C44D16] text-sm font-medium"
                >
                  Forgot Password?
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D45B20] hover:bg-[#C44D16] text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {isForgotPasswordOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-none flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-[rgb(68,63,63)]">
                Forgot Password?
              </h2>
              <button
                onClick={() => setIsForgotPasswordOpen(false)}
                className="text-[rgba(100,92,90)] hover:text-[#111827]"
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
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(false)}
                  className="px-4 py-2 text-[rgba(68,63,63)] hover:text-[#111827] font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D45B20] hover:bg-[#C44D16] text-white rounded-lg text-sm font-medium transition-colors"
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
