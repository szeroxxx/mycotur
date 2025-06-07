import React, { useState, useEffect, useRef } from "react";
import Head from "next/head";
import { useSession } from "next-auth/react";
import { FiUser, FiMail, FiMapPin, FiEdit2, FiX } from "react-icons/fi";
import { FaFacebookF, FaInstagram, FaYoutube } from "react-icons/fa";
import { useProfile } from "@/hooks/useProfile";
import { useData } from "@/contexts/DataContext";
import { getMediaUrl } from "@/utils/mediaHelpers";
import { CircleCheck } from "lucide-react";
import {
  googlePlacesService,
  LocationSuggestion,
} from "@/utils/googlePlacesService";
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

  const [addressInput, setAddressInput] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [isValidAddress, setIsValidAddress] = useState(true);
  const [addressError, setAddressError] = useState<string | null>(null);
  const addressRef = useRef<HTMLDivElement>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [socialErrors, setSocialErrors] = useState<SocialErrors>({});
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

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
    if (profileData.address && profileData.address !== addressInput) {
      setAddressInput(profileData.address);
      setIsValidAddress(true);
      setAddressError(null);
    }
  }, [profileData.address]);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        addressRef.current &&
        !addressRef.current.contains(event.target as Node)
      ) {
        setShowAddressSuggestions(false);
      }
    };

    if (showAddressSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAddressSuggestions]);

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

  const validatePassword = () => {
    if (newPassword.length < 8) {
      setPasswordError(
        "La contraseña debe tener al menos 8 caracteres de longitud"
      );
      return false;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
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
        ] = `Ingrese una URL válida a partir de http:// o https://`;
        isValid = false;
      }
    });
    setSocialErrors(errors);
    return isValid;
  };

  const handleAddressChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;

    if (isValidAddress && value !== addressInput) {
      setIsValidAddress(false);
      setAddressError(
        "Seleccione una dirección de las sugerencias a continuación"
      );
      setProfileData((prev) => ({
        ...prev,
        address: "",
      }));
    }

    setAddressInput(value);

    if (value.length > 2) {
      try {
        const suggestions = await googlePlacesService.searchPlaces(value);
        setAddressSuggestions(suggestions);
        setShowAddressSuggestions(suggestions.length > 0);

        if (suggestions.length === 0) {
          setAddressError(
            "No se encontraron ubicaciones válidas. Busque lugares en Valle del Tiétar, La Moraña, Valle de Amblés, Sierra de Gredos o Alberche Pinares."
          );
        } else {
          setAddressError(
            "Seleccione una dirección de las sugerencias a continuación"
          );
        }
      } catch (error) {
        console.error("Error fetching addresses:", error);
        setAddressSuggestions([]);
        setShowAddressSuggestions(false);
        setAddressError(
          "Error al buscar direcciones. Por favor, inténtalo de nuevo."
        );
      }
    } else {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      if (value.length > 0 && !isValidAddress) {
        setAddressError(
          "Ingrese al menos 3 caracteres para buscar direcciones"
        );
      } else {
        setAddressError(null);
      }
    }
  };

  const handleAddressSuggestionClick = (suggestion: LocationSuggestion) => {
    const addressValue = `${suggestion.display_place}, ${suggestion.display_address}`;

    setProfileData((prev) => ({
      ...prev,
      address: addressValue,
    }));
    setAddressInput(addressValue);
    setAddressSuggestions([]);
    setShowAddressSuggestions(false);
    setIsValidAddress(true);
    setAddressError(null);
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
        "No se ha cambiado la contraseña. Por favor, compruebe su contraseña actual."
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
        error instanceof Error ? error.message : "No se pudo cargar la imagen."
      );
    } finally {
      setIsUploadingImage(false);
      e.target.value = "";
    }
  };

  return (
    <>
      <Head>
        <title>Mi Perfil | Mycotur</title>
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-[rgb(68,63,63)]">
            Mi Perfil
          </h1>
          {!isEditing ? (
            <button
              onClick={handleEditToggle}
              className="text-[rgba(68,63,63)] hover:text-[#D45B20] transition-colors flex-shrink-0 cursor-pointer"
            >
              <FiEdit2 size={20} />
            </button>
          ) : (
            <div className="flex gap-2 sm:gap-4 flex-shrink-0">
              <button
                onClick={handleCancelEdit}
                className="cursor-pointer px-3 sm:px-4 py-2 text-[rgba(68,63,63)] hover:text-[#111827] font-medium text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="cursor-pointer px-3 sm:px-4 py-2 bg-[#D45B20] hover:bg-[#C44D16] text-white rounded-lg text-sm font-medium transition-colors"
              >
                Guardar
              </button>
            </div>
          )}
        </div>
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
                  className="cursor-pointer absolute -bottom-1 -right-1 sm:-bottom-2 sm:-right-2 w-8 h-8 sm:w-10 sm:h-10 bg-[#D45B20] hover:bg-[#C44D16] text-white rounded-full flex items-center justify-center transition-all duration-200 shadow-lg  disabled:opacity-50 disabled:cursor-not-allowed"
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
                  Imagen de Perfil
                </p>
                <p className="text-xs text-[rgba(100,92,90)]">
                  Haga clic en el botón de edición para cargar una nueva imagen
                </p>
                <p className="text-xs text-[rgba(100,92,90)]">
                  Compatible: JPG, PNG, WebP (max 5MB)
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
                  <p className="text-sm text-[rgba(100,92,90)]">
                    Nombre de la organización
                  </p>
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
                  <p className="text-sm text-[rgba(100,92,90)]">
                    Correo electrónico
                  </p>
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
                  <p className="text-sm text-[rgba(100,92,90)]">
                    Correo electrónico principal
                  </p>
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
                      placeholder="Ingrese su correo electrónico principal"
                      className="w-full p-2 text-[rgb(68,63,63)] border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-[#D45B20] text-sm"
                    />
                  ) : (
                    <p className="text-[rgb(68,63,63)] font-medium break-all sm:break-normal">
                      {profileData.primaryMail || "Not provided"}
                    </p>
                  )}
                </div>
              </div>{" "}
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4 p-3 sm:p-4 bg-[rgba(253,250,246)] rounded-lg">
                <div className="p-3 bg-[rgba(255,255,255)] rounded-full border border-[rgba(226,225,223)] self-center sm:self-auto">
                  <FiMapPin
                    size={20}
                    className="sm:size-6 text-[rgba(194,91,52)]"
                  />
                </div>
                <div className="flex-grow text-center sm:text-left">
                  <p className="text-sm text-[rgba(100,92,90)]">Dirección</p>
                  {isEditing ? (
                    <div className="relative" ref={addressRef}>
                      <input
                        type="text"
                        value={addressInput}
                        onChange={handleAddressChange}
                        placeholder="Start typing to search for addresses (e.g., Valle del Tiétar, Sierra de Gredos...)"
                        className={`w-full p-2 text-[rgb(68,63,63)] border rounded text-sm focus:outline-none focus:ring-1 ${
                          addressError && !isValidAddress
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : isValidAddress
                            ? "border-green-500 focus:ring-green-500 focus:border-green-500"
                            : "border-gray-300 focus:ring-[#D45B20] focus:border-[#D45B20]"
                        }`}
                      />
                      {addressError && (
                        <p className="mt-1 text-sm text-red-600">
                          {addressError}
                        </p>
                      )}
                      {!addressError &&
                        !isValidAddress &&
                        addressInput.length === 0 && (
                          <p className="mt-1 text-sm text-gray-500">
                            Debe seleccionar una dirección de las sugerencias
                            que aparece mientras escribes. La entrada de
                            dirección manual no es permitido.
                          </p>
                        )}
                      {isValidAddress && profileData.address && (
                        <p className="mt-1 text-sm text-green-600 flex items-center">
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Dirección válida seleccionada
                        </p>
                      )}
                      {showAddressSuggestions &&
                        addressSuggestions.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {addressSuggestions.map((suggestion) => (
                              <div
                                key={suggestion.place_id}
                                className="px-4 py-2 hover:bg-[#FFF5F1] cursor-pointer border-b border-gray-100 last:border-b-0"
                                onClick={() =>
                                  handleAddressSuggestionClick(suggestion)
                                }
                              >
                                <div className="font-medium text-[rgba(142,133,129)]">
                                  {suggestion.display_place}
                                </div>
                                <div className="text-xs text-[rgba(142,133,129)]">
                                  {suggestion.display_address}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      {showAddressSuggestions &&
                        addressSuggestions.length === 0 &&
                        addressInput.length > 2 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                            <div className="text-sm text-gray-500 text-center">
                              No se encontraron direcciones en las regiones
                              objetivo. Intentar buscando lugares en Valle del
                              Tiétar, La Moraña, Valle de Amblés, Sierra de
                              Gredos, o Alberche Pinares.
                            </div>
                          </div>
                        )}
                    </div>
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
                Sobre nosotros
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
                  placeholder="Escribe una descripción de vuestra organización y a qué os dedicáis."
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
                Enlaces de redes sociales
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
                        {profileData.social.facebook ||
                          "Ingrese su enlace de perfil de Facebook"}
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
                        {profileData.social.instagram ||
                          "Ingrese su enlace de perfil de Instagram"}
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
                        {profileData.social.youtube ||
                          "Ingrese su enlace de perfil de Youtube"}
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
                Categorías
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
                        isSelected ? "border border-[#D45B20]" : ""
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
                            className="cursor-pointer w-4 h-4 text-[#D45B20] bg-white border-gray-300 rounded focus:ring-[#D45B20]"
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
                Cambiar Contraseña
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
                Cambiar Contraseña
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
                  Contraseña actual
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
                  Nueva contraseña
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
                  Confirmar nueva contraseña
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
                  ¿Has olvidado tu contraseña?
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 bg-[#D45B20] hover:bg-[#C44D16] text-white rounded-lg text-sm font-medium transition-colors order-1 sm:order-2"
                >
                  Actualizar
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
                ¿Has olvidado tu contraseña?
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
                  Correo electrónico
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
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 bg-[#D45B20] hover:bg-[#C44D16] text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Continuar
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
