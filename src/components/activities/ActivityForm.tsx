import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Activity } from "../../types/activity";
import { MdDelete, MdPlayCircle } from "react-icons/md";
import { getMediaUrl } from "../../utils/mediaHelpers";
import {
  googlePlacesService,
  LocationSuggestion,
} from "../../utils/googlePlacesService";
import { validateSpanishPhoneNumber } from "../../utils/phoneValidation";
import { validateUrl } from "../../utils/urlValidation";
import SpanishMonthPicker from "../ui/SpanishMonthPicker";

interface Category {
  uuid: string;
  title: string;
  description: string;
}

const MAX_FILE_SIZE_MB = 15;
const MAX_IMAGES = 10;
const MAX_VIDEOS = 3;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/mov"];

interface ActivityFormProps {
  activity: Partial<Activity>;
  categories: Category[];
  onSubmit: (e: React.FormEvent) => void;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const RequiredIndicator = () => (
  <span className="text-[rgba(220,38,38,1)]">*</span>
);

export const ActivityForm: React.FC<ActivityFormProps> = ({
  activity,
  categories,
  onSubmit,
  onChange,
  onCancel,
  isLoading = false,
}) => {
  const [locationInput, setLocationInput] = useState(activity.location || "");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isValidLocation, setIsValidLocation] = useState(!!activity.location);
  const [locationError, setLocationError] = useState<string | null>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewVideos, setPreviewVideos] = useState<string[]>([]);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverVideoIndex, setHoverVideoIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleInvalidInput = (
    e: React.FormEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const target = e.currentTarget;
    if (target.validity.valueMissing) {
      target.setCustomValidity("Este campo es obligatorio.");
    } else {
      target.setCustomValidity("");
    }
  };

  const handleInputChange = (
    e: React.FormEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    e.currentTarget.setCustomValidity("");
  };

  useEffect(() => {
    if (activity.location && activity.location !== locationInput) {
      setLocationInput(activity.location);
      setIsValidLocation(true);
      setLocationError(null);
    }
  }, [activity.location]);

  const handleLocationChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;

    if (isValidLocation && value !== locationInput) {
      setIsValidLocation(false);
      setLocationError(
        "Seleccione una ubicación de las sugerencias a continuación"
      );
      const clearEvent = {
        target: {
          name: "location",
          value: "",
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(clearEvent);
    }

    setLocationInput(value);

    if (value.length > 2) {
      try {
        const suggestions = await googlePlacesService.searchPlaces(value);
        setSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);

        if (suggestions.length === 0) {
          setLocationError(
            "No se encontraron ubicaciones válidas. Por favor, busca lugares en Valle del Tiétar, La Moraña, Valle de Amblés, Sierra de Gredos o Alberche Pinares."
          );
        } else {
          setLocationError(
            "Seleccione una ubicación de las sugerencias a continuación"
          );
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
        setSuggestions([]);
        setShowSuggestions(false);
        setLocationError(
          "Error al buscar ubicaciones. Por favor, inténtalo de nuevo."
        );
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      if (value.length > 0 && !isValidLocation) {
        setLocationError(
          "Por favor, ingresa al menos 3 caracteres para buscar ubicaciones"
        );
      } else {
        setLocationError(null);
      }
    }
  };
  const handleSuggestionClick = (suggestion: LocationSuggestion) => {
    const locationValue = `${suggestion.display_place}, ${suggestion.display_address}`;

    const event = {
      target: {
        name: "location",
        value: locationValue,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    const lat = {
      target: {
        name: "lat",
        value: suggestion.lat,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    const lon = {
      target: {
        name: "lon",
        value: suggestion.lon,
      },
    } as React.ChangeEvent<HTMLInputElement>;

    onChange(event);
    onChange(lat);
    onChange(lon);
    setLocationInput(locationValue);
    setSuggestions([]);
    setShowSuggestions(false);
    setIsValidLocation(true);
    setLocationError(null);
  };
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const phoneValue = e.target.value;
    onChange(e);
    if (phoneValue.trim()) {
      const validation = validateSpanishPhoneNumber(phoneValue);
      if (!validation.isValid) {
        setPhoneError(validation.errorMessage || null);
      } else {
        setPhoneError(null);
      }
    } else {
      setPhoneError(null);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const urlValue = e.target.value;
    onChange(e);

    const validation = validateUrl(urlValue);
    if (!validation.isValid) {
      setUrlError(validation.errorMessage || null);
    } else {
      setUrlError(null);
    }
  };

  const handleImageRemove = (index: number) => {
    try {
      const currentImages = [...(activity.images || [])];
      const currentMediaUrls = [...(activity.mediaUrls || [])];

      const existingImages = currentMediaUrls.filter((media) =>
        media.type.startsWith("image")
      );

      const existingImageCount = existingImages.length;

      if (index < existingImageCount) {
        const imageToRemove = existingImages[index];
        const mediaIndex = currentMediaUrls.findIndex(
          (media) =>
            media.name === imageToRemove.name &&
            media.type === imageToRemove.type
        );
        if (mediaIndex > -1) {
          currentMediaUrls.splice(mediaIndex, 1);
        }
      } else {
        const newImageIndex = index - existingImageCount;
        if (newImageIndex >= 0 && newImageIndex < currentImages.length) {
          currentImages.splice(newImageIndex, 1);
        }
      }
      const imageEvent = {
        target: {
          name: "images",
          value: currentImages,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      const mediaEvent = {
        target: {
          name: "mediaUrls",
          value: currentMediaUrls,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      onChange(imageEvent);
      onChange(mediaEvent);
    } catch (error) {
      console.error("Error in handleImageRemove:", error);
      setUploadError(
        "Fallo al eliminar la imagen. Por favor, inténtalo de nuevo."
      );
    }
  };

  const handleVideoRemove = (index: number) => {
    try {
      const currentVideos = [...(activity.videos || [])];
      const currentMediaUrls = [...(activity.mediaUrls || [])];

      const existingVideos = currentMediaUrls.filter((media) =>
        media.type.startsWith("video")
      );

      const existingVideoCount = existingVideos.length;

      if (index < existingVideoCount) {
        const videoToRemove = existingVideos[index];
        const mediaIndex = currentMediaUrls.findIndex(
          (media) =>
            media.name === videoToRemove.name &&
            media.type === videoToRemove.type
        );
        if (mediaIndex > -1) {
          currentMediaUrls.splice(mediaIndex, 1);
        }
      } else {
        const newVideoIndex = index - existingVideoCount;
        if (newVideoIndex >= 0 && newVideoIndex < currentVideos.length) {
          currentVideos.splice(newVideoIndex, 1);
        }
      }
      const videoEvent = {
        target: {
          name: "videos",
          value: currentVideos,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      const mediaEvent = {
        target: {
          name: "mediaUrls",
          value: currentMediaUrls,
        },
      } as unknown as React.ChangeEvent<HTMLInputElement>;

      onChange(videoEvent);
      onChange(mediaEvent);
    } catch (error) {
      console.error("Error in handleVideoRemove:", error);
      setUploadError(
        "Fallo al eliminar el video. Por favor, inténtalo de nuevo."
      );
    }
  };

  const handleMediaUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const newFiles = Array.from(e.target.files);
    setUploadError(null);

    const imageFiles: File[] = [];
    const videoFiles: File[] = [];
    for (const file of newFiles) {
      if (ALLOWED_IMAGE_TYPES.includes(file.type)) {
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          setUploadError(
            `La imagen ${file.name} excede el límite de ${MAX_FILE_SIZE_MB}MB`
          );
          return;
        }
        imageFiles.push(file);
      } else if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
        if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
          setUploadError(
            `El video ${file.name} excede el límite de ${MAX_FILE_SIZE_MB}MB`
          );
          return;
        }
        videoFiles.push(file);
      } else {
        setUploadError(
          `El archivo ${file.name} no está permitido. Solo se admiten imágenes JPG, PNG, WebP y videos MP4, WebM, MOV.`
        );
        return;
      }
    }

    const existingImages = activity.images || [];
    const existingVideos = activity.videos || [];
    const existingImageUrls =
      activity.mediaUrls?.filter((media) => media.type.startsWith("image")) ||
      [];
    const existingVideoUrls =
      activity.mediaUrls?.filter((media) => media.type.startsWith("video")) ||
      [];

    const totalImages = existingImages.length + existingImageUrls.length;
    const totalVideos = existingVideos.length + existingVideoUrls.length;

    if (totalImages + imageFiles.length > MAX_IMAGES) {
      const remaining = MAX_IMAGES - totalImages;
      setUploadError(
        `Demasiadas imágenes. Máximo ${MAX_IMAGES} imágenes permitidas. Puede subir ${
          remaining > 0 ? remaining : "ninguna"
        } imagen${remaining !== 1 ? "es" : ""} más.`
      );
      return;
    }

    if (totalVideos + videoFiles.length > MAX_VIDEOS) {
      const remaining = MAX_VIDEOS - totalVideos;
      setUploadError(
        `Demasiados videos. Máximo ${MAX_VIDEOS} videos permitidos. Puede subir ${
          remaining > 0 ? remaining : "ningún"
        } video${remaining !== 1 ? "s" : ""} más.`
      );
      return;
    }

    for (const file of newFiles) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setUploadError(
          `Los archivos deben ser menores de ${MAX_FILE_SIZE_MB}MB`
        );
        return;
      }
    }

    setIsUploading(true);
    try {
      if (imageFiles.length > 0) {
        const updatedImages = [...existingImages, ...imageFiles];
        const imageEvent = {
          target: {
            name: "images",
            value: updatedImages,
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange(imageEvent);
      }

      if (videoFiles.length > 0) {
        const updatedVideos = [...existingVideos, ...videoFiles];
        const videoEvent = {
          target: {
            name: "videos",
            value: updatedVideos,
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange(videoEvent);
      }
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationRef.current &&
        !locationRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscapeKey);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, [locationRef]);

  useEffect(() => {
    previewImages.forEach((url) => {
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });
    previewVideos.forEach((url) => {
      if (url.startsWith("blob:")) {
        URL.revokeObjectURL(url);
      }
    });

    const newPreviewImages: string[] = [];
    const newPreviewVideos: string[] = [];

    if (activity.mediaUrls && activity.mediaUrls.length > 0) {
      const imageMedias = activity.mediaUrls.filter((media) =>
        media.type.startsWith("image")
      );
      const existingImageUrls = imageMedias.map((media) => {
        const url = getMediaUrl(media.name);
        return url;
      });

      const videoMedias = activity.mediaUrls.filter((media) =>
        media.type.startsWith("video")
      );

      const existingVideoUrls = videoMedias.map((media) => {
        const url = getMediaUrl(media.name);
        return url;
      });

      newPreviewImages.push(...existingImageUrls);
      newPreviewVideos.push(...existingVideoUrls);
    }

    if (activity.images && activity.images.length > 0) {
      const fileUrls = activity.images.map((file) => URL.createObjectURL(file));
      newPreviewImages.push(...fileUrls);
    }

    if (activity.videos && activity.videos.length > 0) {
      const videoUrls = activity.videos.map((file) =>
        URL.createObjectURL(file)
      );
      newPreviewVideos.push(...videoUrls);
    }

    setPreviewImages(newPreviewImages);
    setPreviewVideos(newPreviewVideos);

    return () => {
      newPreviewImages.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
      newPreviewVideos.forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [activity.images, activity.videos, activity.mediaUrls, activity.id]);
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidLocation || !activity.location) {
      setLocationError(
        "Por favor, seleccione una ubicación válida de las sugerencias"
      );
      return;
    }
    if (activity.phone && activity.phone.trim()) {
      const phoneValidation = validateSpanishPhoneNumber(activity.phone);
      if (!phoneValidation.isValid) {
        setPhoneError(phoneValidation.errorMessage || null);
        return;
      }
    }
    setPhoneError(null);

    if (activity.url && activity.url.trim()) {
      const urlValidation = validateUrl(activity.url);
      if (!urlValidation.isValid) {
        setUrlError(urlValidation.errorMessage || null);
        return;
      }
    }
    setUrlError(null);

    onSubmit(e);
  };

  const currentImageCount =
    (activity.images?.length || 0) +
    (activity.mediaUrls?.filter((media) => media.type.startsWith("image"))
      .length || 0);
  const currentVideoCount =
    (activity.videos?.length || 0) +
    (activity.mediaUrls?.filter((media) => media.type.startsWith("video"))
      .length || 0);
  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-sm text-[rgba(68,63,63)] mb-2">
          Título de la Actividad <RequiredIndicator />
        </label>{" "}
        <input
          placeholder="Nombre de la Actividad"
          type="text"
          name="title"
          value={activity.title || ""}
          onChange={onChange}
          onInvalid={handleInvalidInput}
          onInput={handleInputChange}
          className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
          required
        />
      </div>{" "}
      <div>
        {" "}
        <label className="block text-sm font-medium text-[rgba(68,63,63)] mb-2">
          Selecciona a qué categorías pertenece esta actividad{" "}
          <RequiredIndicator />
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border border-[#E5E7EB] rounded-lg bg-gray-50/50">
          {categories.map((category) => (
            <label
              key={category.uuid}
              className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-white/80 p-2 rounded-md transition-colors"
            >
              <input
                type="checkbox"
                name="categories"
                value={category.title}
                checked={(activity.categories || []).includes(category.title)}
                onChange={(e) => {
                  const currentCategories = activity.categories || [];
                  let newCategories;

                  if (e.target.checked) {
                    newCategories = [...currentCategories, category.title];
                  } else {
                    newCategories = currentCategories.filter(
                      (cat) => cat !== category.title
                    );
                  }

                  const categoryEvent = {
                    target: {
                      name: "categories",
                      value: newCategories,
                    },
                  } as unknown as React.ChangeEvent<HTMLInputElement>;

                  onChange(categoryEvent);
                }}
                className="w-4 h-4 text-[#D45B20] bg-gray-100 border-gray-300 rounded focus:ring-[#D45B20] focus:ring-2"
              />
              <span className="text-[rgba(68,63,63)] select-none">
                {category.title}
              </span>
            </label>
          ))}
        </div>
        {(!activity.categories || activity.categories.length === 0) && (
          <p className="mt-1 text-sm text-red-600">
            Seleccione al menos una categorías
          </p>
        )}
        {activity.categories && activity.categories.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {activity.categories.map((categoryTitle) => (
              <span
                key={categoryTitle}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#D45B20]/10 text-[#D45B20] border border-[#D45B20]/20"
              >
                {categoryTitle}
                <button
                  type="button"
                  onClick={() => {
                    const currentCategories = activity.categories || [];
                    const newCategories = currentCategories.filter(
                      (cat) => cat !== categoryTitle
                    );

                    const categoryEvent = {
                      target: {
                        name: "categories",
                        value: newCategories,
                      },
                    } as unknown as React.ChangeEvent<HTMLInputElement>;

                    onChange(categoryEvent);
                  }}
                  className="ml-1 hover:bg-[#D45B20]/20 rounded-full p-0.5 transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-sm text-[rgba(68,63,63)] mb-2">
          Ubicación <RequiredIndicator />
        </label>
        <div className="relative" ref={locationRef}>
          {" "}
          <input
            type="text"
            name="location"
            value={locationInput}
            onChange={handleLocationChange}
            onInvalid={handleInvalidInput}
            onInput={handleInputChange}
            placeholder="Comienza a escribir para buscar ubicaciones (por ejemplo, Valle del Tiétar, Sierra de Gredos...)"
            className={`w-full px-4 py-2 text-[rgba(142,133,129)] border rounded-lg text-sm focus:outline-none focus:ring-1 ${
              locationError && !isValidLocation
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : isValidLocation
                ? "border-green-500 focus:ring-green-500 focus:border-green-500"
                : "border-[#E5E7EB] focus:ring-[#D45B20] focus:border-[#D45B20]"
            }`}
            required
          />
          {locationError && (
            <p className="mt-1 text-sm text-red-600">{locationError}</p>
          )}
          {!locationError && !isValidLocation && locationInput.length === 0 && (
            <p className="mt-1 text-sm text-gray-500">
              Debe seleccionar una ubicación de las sugerencias que aparecen a
              medida que escribe. La entrada manual de ubicaciones no está
              permitida.
            </p>
          )}
          {isValidLocation && (
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
              Ubicación válida seleccionada
            </p>
          )}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.place_id}
                  className="px-4 py-2 hover:bg-[#FFF5F1] cursor-pointer border-b border-gray-100 last:border-b-0"
                  onClick={() => handleSuggestionClick(suggestion)}
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
          {showSuggestions &&
            suggestions.length === 0 &&
            locationInput.length > 2 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                <div className="text-sm text-gray-500 text-center">
                  No se encontraron ubicaciones en las regiones objetivo.
                  Intente buscar lugares en Valle del Tiétar, La Moraña, Valle
                  de Amblés, Sierra de Gredos o Alberche Pinares.
                </div>
              </div>
            )}
        </div>
      </div>
      <div className="w-full max-w-2xl">
        <div className="mb-4">
          <p className="text-[rgba(68,63,63)] text-sm mb-4 font-sm">
            ¿En qué temporada se puede realizar la actividad?
            <RequiredIndicator />
          </p>{" "}
          <div className="flex gap-4">
            <div className="w-full">
              <label className="block text-sm font-sm text-[rgba(142,133,129)] mb-2">
                Mes de Inicio
              </label>
              <div className="relative">
                <SpanishMonthPicker
                  name="startMonth"
                  value={activity.startMonth || ""}
                  onChange={(value) => {
                    const event = {
                      target: {
                        name: "startMonth",
                        value: value,
                      },
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                  }}
                  required
                  className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20] cursor-pointer"
                  placeholder="Seleccionar mes de inicio"
                />
              </div>
            </div>

            <div className="w-full">
              <label className="block text-sm font-sm text-[rgba(142,133,129)] mb-2">
                Mes de finalización
              </label>
              <div className="relative">
                <SpanishMonthPicker
                  name="endMonth"
                  value={activity.endMonth || ""}
                  onChange={(value) => {
                    const event = {
                      target: {
                        name: "endMonth",
                        value: value,
                      },
                    } as React.ChangeEvent<HTMLInputElement>;
                    onChange(event);
                  }}
                  required
                  className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20] cursor-pointer"
                  placeholder="Seleccionar mes de finalización"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[rgba(68,63,63)] mb-2">
          Datos de contacto (Estos datos serán visibles para quienes
          vean la actividad)
          <RequiredIndicator />
        </label>
        <div className="space-y-4">
          {" "}
          <input
            type="tel"
            name="phone"
            value={activity.phone || ""}
            onChange={handlePhoneChange}
            onInvalid={handleInvalidInput}
            onInput={handleInputChange}
            placeholder="Número de teléfono"
            className={`w-full px-4 py-2 text-[rgba(142,133,129)] border rounded-lg text-sm focus:outline-none focus:ring-1 ${
              phoneError
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-[#E5E7EB] focus:ring-[#D45B20] focus:border-[#D45B20]"
            }`}
            required
          />
          {phoneError && (
            <p className="mt-1 text-sm text-red-600">{phoneError}</p>
          )}{" "}
          <input
            type="email"
            name="email"
            value={activity.email || ""}
            onChange={onChange}
            onInvalid={handleInvalidInput}
            onInput={handleInputChange}
            placeholder="Dirección de correo electrónico"
            className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
            required={!activity.phone && !activity.url}
          />{" "}
          <input
            placeholder="Enlace a página web"
            type="text"
            name="url"
            value={activity.url || ""}
            onChange={handleUrlChange}
            onInvalid={handleInvalidInput}
            onInput={handleInputChange}
            className={`w-full px-4 py-2 text-[rgba(142,133,129)] border rounded-lg text-sm focus:outline-none focus:ring-1 ${
              urlError
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-[#E5E7EB] focus:ring-[#D45B20] focus:border-[#D45B20]"
            }`}
            required={!activity.phone && !activity.email}
          />
          {urlError && <p className="mt-1 text-sm text-red-600">{urlError}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[rgba(68,63,63)] mb-2">
          Precio
          <RequiredIndicator />
        </label>
        <textarea
          name="notes"
          value={activity.notes || ""}
          onChange={onChange}
          onInvalid={handleInvalidInput}
          onInput={handleInputChange}
          placeholder="Ej. Actividad gratuita, 5€ por persona (incluye comida y materiales)"
          rows={3}
          required
          className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[rgba(68,63,63)] mb-2">
          Descripción <RequiredIndicator />
        </label>
        <textarea
          name="description"
          value={activity.description || ""}
          onChange={onChange}
          onInvalid={handleInvalidInput}
          onInput={handleInputChange}
          placeholder="Comparte más detalles sobre la actividad y cómo contactar contigo"
          rows={3}
          maxLength={1000}
          className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[rgba(68,63,63)] mb-2">
          Imágenes de la actividad
        </label>
        <div>
          {previewImages.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-[rgba(68,63,63)] mb-2">
                Imágenes ({currentImageCount}/{MAX_IMAGES})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {previewImages.map((url, index) => (
                  <div
                    key={`image-${index}`}
                    className="relative group aspect-square rounded-lg overflow-hidden"
                    onMouseEnter={() => setHoverIndex(index)}
                    onMouseLeave={() => setHoverIndex(null)}
                  >
                    <Image
                      src={url}
                      alt={`Preview ${index + 1}`}
                      fill
                      style={{ objectFit: "cover" }}
                      className="transition-transform duration-200 group-hover:scale-105"
                    />
                    <div
                      className={`absolute inset-0 bg-black bg-opacity-40 transition-opacity duration-200 
                        ${hoverIndex === index ? "opacity-100" : "opacity-0"}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleImageRemove(index)}
                      className={`absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white 
                        rounded-full transition-all duration-200 transform
                        ${
                          hoverIndex === index
                            ? "scale-100 opacity-100"
                            : "scale-75 opacity-0"
                        }`}
                      aria-label="Eliminar imagen"
                    >
                      <MdDelete />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          {previewVideos.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-[rgba(68,63,63)] mb-2">
                Videos ({currentVideoCount}/{MAX_VIDEOS})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {previewVideos.map((url, index) => (
                  <div
                    key={`video-${index}`}
                    className="relative group aspect-video rounded-lg overflow-hidden bg-black"
                    onMouseEnter={() => setHoverVideoIndex(index)}
                    onMouseLeave={() => setHoverVideoIndex(null)}
                  >
                    <video
                      src={url}
                      className="w-full h-full object-cover"
                      muted
                      preload="metadata"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <MdPlayCircle className="text-white text-4xl opacity-70" />
                    </div>
                    <div
                      className={`absolute inset-0 bg-black bg-opacity-40 transition-opacity duration-200 
                        ${
                          hoverVideoIndex === index
                            ? "opacity-100"
                            : "opacity-0"
                        }`}
                    />
                    <button
                      type="button"
                      onClick={() => handleVideoRemove(index)}
                      className={`absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600 text-white 
                        rounded-full transition-all duration-200 transform
                        ${
                          hoverVideoIndex === index
                            ? "scale-100 opacity-100"
                            : "scale-75 opacity-0"
                        }`}
                      aria-label="Remove video"
                    >
                      <MdDelete />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}{" "}
          <div
            className={`border-2 border-dashed border-[#E5E7EB] rounded-lg p-8 text-center transition-colors cursor-pointer
            ${
              isUploading
                ? "bg-gray-50 cursor-not-allowed"
                : "hover:border-[#D45B20]"
            }`}
            onClick={() => {
              if (!isUploading) {
                document.getElementById("activity-media")?.click();
              }
            }}
          >
            <input
              key={`${previewImages.length}-${previewVideos.length}`}
              type="file"
              name="media"
              onChange={handleMediaUpload}
              multiple
              accept={[...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES].join(
                ","
              )}
              className="hidden"
              id="activity-media"
              disabled={isUploading}
            />
            <div
              className={`text-sm ${
                isUploading
                  ? "text-gray-400"
                  : "text-[#6B7280] hover:text-[#D45B20]"
              }`}
            >
              {isUploading
                ? "Cargando..."
                : "Haz clic para subir imágenes o vídeos"}
            </div>
            <p className="text-xs text-[#6B7280] mt-2">
              {uploadError ? (
                <span className="text-red-500">{uploadError}</span>
              ) : (
                `Imágenes: ${currentImageCount}/${MAX_IMAGES} | Vídeos: ${currentVideoCount}/${MAX_VIDEOS} | Máx. ${MAX_FILE_SIZE_MB}MB cada uno`
              )}
            </p>
            <p className="text-xs text-[#6B7280] mt-1">
              Formatos permitidos: JPG, PNG, WebP, MP4, WebM, MOV
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[rgba(68,63,63)]"
          disabled={isLoading}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isLoading || !isValidLocation}
          className={`cursor-pointer px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            isLoading || !isValidLocation
              ? "bg-[#D45B20]/70 cursor-not-allowed"
              : "bg-[#D45B20] hover:bg-[#C44D16]"
          }`}
        >
          {isLoading && (
            <svg
              className="animate-spin h-4 w-4 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          )}
          {isLoading
            ? activity.id
              ? "Actualización..."
              : "Ahorro..."
            : activity.id
            ? "Actualizar"
            : "Guardar"}
        </button>
      </div>
    </form>
  );
};
