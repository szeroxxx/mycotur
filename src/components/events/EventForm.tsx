import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Event } from "../../types/event";
import { Activity } from "../../types/activity";
import { MdDelete, MdPlayCircle } from "react-icons/md";
import { getMediaUrl } from "../../utils/mediaHelpers";
import {
  googlePlacesService,
  LocationSuggestion,
} from "../../utils/googlePlacesService";
import { validateSpanishPhoneNumber } from "../../utils/phoneValidation";
import { validateUrl } from "../../utils/urlValidation";

const MAX_FILE_SIZE_MB = 10;
const MAX_VIDEO_SIZE_MB = 15;
const MAX_IMAGES = 10;
const MAX_VIDEOS = 3;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/mov"];

interface Category {
  uuid: string;
  title: string;
  description: string;
}

interface EventFormProps {
  event: Partial<Event>;
  categories: Category[];
  onSubmit: (e: React.FormEvent) => void;
  onChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  onCancel: () => void;
  activities: Activity[];
  onActivitySelect?: (activity: Activity | undefined) => void;
  isLoading?: boolean;
  onCategoriesChange?: (categories: string[]) => void;
}

const RequiredIndicator = () => (
  <span className="text-[rgba(220,38,38,1)]">*</span>
);

export const EventForm: React.FC<EventFormProps> = ({
  event,
  categories,
  onSubmit,
  onChange,
  onCancel,
  activities,
  onActivitySelect,
  isLoading = false,
  onCategoriesChange,
}) => {
  const [locationInput, setLocationInput] = useState(event.location || "");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isValidLocation, setIsValidLocation] = useState(!!event.location);
  const [locationError, setLocationError] = useState<string | null>(null);
  const locationRef = useRef<HTMLDivElement>(null);

  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    event.categories || (event.category ? [event.category] : [])
  );
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Phone validation state
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewVideos, setPreviewVideos] = useState<string[]>([]);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverVideoIndex, setHoverVideoIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  useEffect(() => {
    if (event.location && event.location !== locationInput) {
      setLocationInput(event.location);
      setIsValidLocation(true);
      setLocationError(null);
    }
  }, [event.location]);

  useEffect(() => {
    const eventCategories =
      event.categories || (event.category ? [event.category] : []);
    setSelectedCategories(eventCategories);
  }, [event.categories, event.category]);

  const handleCategoryChange = (categoryTitle: string) => {
    const updatedCategories = selectedCategories.includes(categoryTitle)
      ? selectedCategories.filter((cat) => cat !== categoryTitle)
      : [...selectedCategories, categoryTitle];

    setSelectedCategories(updatedCategories);
    setCategoriesError(
      updatedCategories.length === 0
        ? "Seleccione al menos una categoría"
        : null
    );

    if (onCategoriesChange) {
      onCategoriesChange(updatedCategories);
    }
  };

  const handleAutoFillActivitySelect = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedId = e.target.value ? Number(e.target.value) : null;
    const selectedActivity = selectedId
      ? activities.find((activity) => Number(activity.id) === selectedId)
      : undefined;

    if (onActivitySelect) {
      onActivitySelect(selectedActivity);
    }
    onChange({
      ...e,
      target: {
        ...e.target,
        name: "activityId",
        value: e.target.value,
      },
    } as React.ChangeEvent<HTMLSelectElement>);

    if (selectedActivity) {
      onChange({
        ...e,
        target: {
          ...e.target,
          name: "activityName",
          value: selectedActivity.title,
        },
      } as React.ChangeEvent<HTMLSelectElement>);

      if (selectedActivity.description) {
        onChange({
          ...e,
          target: {
            ...e.target,
            name: "description",
            value: selectedActivity.description,
          },
        } as React.ChangeEvent<HTMLSelectElement>);
      }
    }
  };

  const handleRegularActivitySelect = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    onChange(e);
  };
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
      const totalImageCount = previewImages.length;
      if (index < 0 || index >= totalImageCount) {
        setUploadError(
          "Selección de imagen no válida. Por favor, inténtalo de nuevo."
        );
        return;
      }
      const currentImages = [...(event.images || [])];
      const currentMediaUrls = [...(event.mediaUrls || [])];
      const existingImages = currentMediaUrls.filter((media) =>
        media.type.startsWith("image")
      );
      const existingImageCount = existingImages.length;
      if (index < existingImageCount) {
        const imageToRemove = existingImages[index];
        const updatedMediaUrls = currentMediaUrls.filter((media) => {
          if (media.type.startsWith("image")) {
            const shouldKeep = !(
              media.name === imageToRemove.name &&
              media.type === imageToRemove.type
            );
            return shouldKeep;
          }
          return true;
        });

        const mediaEvent = {
          target: {
            name: "mediaUrls",
            value: updatedMediaUrls,
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange(mediaEvent);
      } else {
        const newImageIndex = index - existingImageCount;

        if (newImageIndex >= 0 && newImageIndex < currentImages.length) {
          const updatedImages = currentImages.filter((_, idx) => {
            const shouldKeep = idx !== newImageIndex;
            return shouldKeep;
          });

          const imageEvent = {
            target: {
              name: "images",
              value: updatedImages,
            },
          } as unknown as React.ChangeEvent<HTMLInputElement>;
          onChange(imageEvent);
        } else {
          console.error(
            "Invalid new image index:",
            newImageIndex,
            "Available:",
            currentImages.length
          );
          setUploadError("Fallo al eliminar la imagen. Selección no válida.");
          return;
        }
      }

      setUploadError(null);
    } catch (error) {
      console.error("❌ Error in handleImageRemove:", error);
      setUploadError(
        "Fallo al eliminar la imagen. Por favor, inténtalo de nuevo."
      );
    }
  };
  const handleVideoRemove = (index: number) => {
    try {
      const totalVideoCount = previewVideos.length;
      if (index < 0 || index >= totalVideoCount) {
        console.error(
          "Invalid video index:",
          index,
          "Total videos:",
          totalVideoCount
        );
        setUploadError(
          "Selección de video no válida. Por favor, inténtalo de nuevo."
        );
        return;
      }

      const currentVideos = [...(event.videos || [])];
      const currentMediaUrls = [...(event.mediaUrls || [])];

      const existingVideos = currentMediaUrls.filter((media) =>
        media.type.startsWith("video")
      );
      const existingVideoCount = existingVideos.length;

      if (index < existingVideoCount) {
        const videoToRemove = existingVideos[index];

        const updatedMediaUrls = currentMediaUrls.filter((media) => {
          if (media.type.startsWith("video")) {
            const shouldKeep = !(
              media.name === videoToRemove.name &&
              media.type === videoToRemove.type
            );

            return shouldKeep;
          }
          return true;
        });

        const mediaEvent = {
          target: {
            name: "mediaUrls",
            value: updatedMediaUrls,
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange(mediaEvent);
      } else {
        const newVideoIndex = index - existingVideoCount;

        if (newVideoIndex >= 0 && newVideoIndex < currentVideos.length) {
          const updatedVideos = currentVideos.filter((_, idx) => {
            const shouldKeep = idx !== newVideoIndex;

            return shouldKeep;
          });

          const videoEvent = {
            target: {
              name: "videos",
              value: updatedVideos,
            },
          } as unknown as React.ChangeEvent<HTMLInputElement>;
          onChange(videoEvent);
        } else {
          console.error(
            "Invalid new video index:",
            newVideoIndex,
            "Available:",
            currentVideos.length
          );
          setUploadError("Fallo al eliminar el video. Selección no válida.");
          return;
        }
      }

      setUploadError(null);
    } catch (error) {
      console.error("❌ Error in handleVideoRemove:", error);
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
        if (file.size > 10 * 1024 * 1024) {
          setUploadError(`La imagen ${file.name} excede el límite de 10MB`);
          return;
        }
        imageFiles.push(file);
      } else if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
        if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
          setUploadError(
            `El video ${file.name} excede el límite de ${MAX_VIDEO_SIZE_MB}MB`
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
    const existingImages = event.images || [];
    const existingVideos = event.videos || [];
    const existingImageUrls =
      event.mediaUrls?.filter((media) => media.type.startsWith("image")) || [];
    const existingVideoUrls =
      event.mediaUrls?.filter((media) => media.type.startsWith("video")) || [];

    const totalImages = existingImages.length + existingImageUrls.length;
    const totalVideos = existingVideos.length + existingVideoUrls.length;

    if (totalImages + imageFiles.length > MAX_IMAGES) {
      const remaining = MAX_IMAGES - totalImages;
      setUploadError(
        `Demasiadas imágenes. Máximo ${MAX_IMAGES} imágenes permitidas. Puedes subir ${
          remaining > 0 ? remaining : "ninguna"
        } imagen${remaining !== 1 ? "es" : ""} más.`
      );
      return;
    }

    if (totalVideos + videoFiles.length > MAX_VIDEOS) {
      const remaining = MAX_VIDEOS - totalVideos;
      setUploadError(
        `Demasiados videos. Máximo ${MAX_VIDEOS} videos permitidos. Puedes subir ${
          remaining > 0 ? remaining : "ningún"
        } video${remaining !== 1 ? "s" : ""} más.`
      );
      return;
    }
    for (const file of newFiles) {
      if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
        setUploadError(
          `Los archivos deben ser menores de ${MAX_VIDEO_SIZE_MB}MB`
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

    if (event.mediaUrls && event.mediaUrls.length > 0) {
      const imageMedias = event.mediaUrls.filter((media) =>
        media.type.startsWith("image")
      );
      const existingImageUrls = imageMedias.map((media) => {
        const url = getMediaUrl(media.name);
        return url;
      });

      const videoMedias = event.mediaUrls.filter((media) =>
        media.type.startsWith("video")
      );

      const existingVideoUrls = videoMedias.map((media) => {
        const url = getMediaUrl(media.name);
        return url;
      });

      newPreviewImages.push(...existingImageUrls);
      newPreviewVideos.push(...existingVideoUrls);
    }

    if (event.images && event.images.length > 0) {
      const fileUrls = event.images.map((file) => {
        const url = URL.createObjectURL(file);
        return url;
      });
      newPreviewImages.push(...fileUrls);
    }

    if (event.videos && event.videos.length > 0) {
      const videoUrls = event.videos.map((file) => {
        const url = URL.createObjectURL(file);
        return url;
      });
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
  }, [event.images, event.videos, event.mediaUrls, event.id]);

  const currentImageCount =
    (event.images?.length || 0) +
    (event.mediaUrls?.filter((media) => media.type.startsWith("image"))
      .length || 0);
  const currentVideoCount =
    (event.videos?.length || 0) +
    (event.mediaUrls?.filter((media) => media.type.startsWith("video"))
      .length || 0);
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidLocation || !event.location) {
      setLocationError(
        "Por favor, seleccione una ubicación válida de las sugerencias"
      );
      return;
    }

    if (selectedCategories.length === 0) {
      setCategoriesError("Seleccione al menos una categoría");
      return;
    } // Validate phone number if provided
    if (event.phone && event.phone.trim()) {
      const phoneValidation = validateSpanishPhoneNumber(event.phone);
      if (!phoneValidation.isValid) {
        setPhoneError(phoneValidation.errorMessage || null);
        return;
      }
    }
    setPhoneError(null);

    if (event.url && event.url.trim()) {
      const urlValidation = validateUrl(event.url);
      if (!urlValidation.isValid) {
        setUrlError(urlValidation.errorMessage || null);
        return;
      }
    }
    setUrlError(null);

    onSubmit(e);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[rgba(68,63,63)] mb-2">
          Rellenar automáticamente con una actividad existente (opcional)
        </label>
        <select
          name="activityName"
          value={event.activityId?.toString() || ""}
          onChange={handleAutoFillActivitySelect}
          className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
        >
          <option value="">Selecciona una actividad</option>
          {activities.map((activity) => (
            <option key={activity.id} value={activity.id.toString()}>
              {activity.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-[rgba(68,63,63)] mb-2">
          Actividad relacionada <RequiredIndicator />
        </label>{" "}
        <select
          name="activityId"
          value={event.activityId?.toString() || ""}
          onChange={handleRegularActivitySelect}
          className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
          required
        >
          <option value="">Selecciona una actividad</option>
          {activities.map((activity) => (
            <option key={activity.id} value={activity.id.toString()}>
              {activity.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-[rgba(68,63,63)] mb-2">
          Nombre del evento <RequiredIndicator />
        </label>
        <input
          type="text"
          name="event"
          value={event.event || ""}
          onChange={onChange}
          placeholder="Ej. Ruta micológica al atardecer"
          className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
          required
        />
      </div>{" "}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[rgba(68,63,63)] mb-2">
            Fecha del Evento <RequiredIndicator />
          </label>
          <div className="relative">
            <input
              type="date"
              name="eventDate"
              value={
                event.eventDate
                  ? new Date(event.eventDate).toISOString().split("T")[0]
                  : ""
              }
              onChange={onChange}
              className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20] cursor-pointer"
              style={{
                WebkitAppearance: "none",
                MozAppearance: "textfield",
                position: "relative",
                background: "transparent",
              }}
              onClick={(e) => {
                e.currentTarget.showPicker?.();
              }}
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[rgba(68,63,63)] mb-2">
            Hora del Evento <RequiredIndicator />
          </label>
          <div className="relative">
            <input
              type="time"
              name="eventTime"
              value={
                event.eventTime
                  ? new Date(
                      `2000-01-01 ${event.eventTime}`
                    ).toLocaleTimeString("en-US", {
                      hour12: false,
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""
              }
              onChange={onChange}
              className="w-full px-4 py-2 border text-[rgba(142,133,129)] border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20] cursor-pointer"
              style={{
                WebkitAppearance: "none",
                MozAppearance: "textfield",
                position: "relative",
                background: "transparent",
              }}
              onClick={(e) => {
                e.currentTarget.showPicker?.();
              }}
              required
            />
          </div>
        </div>
      </div>{" "}
      <div>
        <label className="block text-sm font-medium text-[rgba(68,63,63)] mb-2">
          Categorías del Evento <RequiredIndicator />
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-4 border border-[#E5E7EB] rounded-lg bg-gray-50/50">
          {categories.map((category) => (
            <label
              key={category.uuid}
              className="flex items-center space-x-2 text-sm cursor-pointer hover:bg-white/80 p-2 rounded-md transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(category.title)}
                onChange={() => handleCategoryChange(category.title)}
                className="w-4 h-4 text-[#D45B20] bg-gray-100 border-gray-300 rounded focus:ring-[#D45B20] focus:ring-2"
              />
              <span className="text-[rgba(68,63,63)] select-none">
                {category.title}
              </span>
            </label>
          ))}
        </div>
        {categoriesError && (
          <p className="mt-1 text-sm text-red-600">{categoriesError}</p>
        )}
        {selectedCategories.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {selectedCategories.map((categoryTitle) => (
              <span
                key={categoryTitle}
                className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#D45B20]/10 text-[#D45B20] border border-[#D45B20]/20"
              >
                {categoryTitle}
                <button
                  type="button"
                  onClick={() => handleCategoryChange(categoryTitle)}
                  className="ml-1 hover:bg-[#D45B20]/20 rounded-full p-0.5 transition-colors"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>{" "}
      <div>
        <label className="block text-sm font-sm text-[rgba(68,63,63)] mb-2">
          Ubicación <RequiredIndicator />
        </label>
        <div className="relative" ref={locationRef}>
          <input
            type="text"
            name="location"
            value={locationInput}
            onChange={handleLocationChange}
            placeholder="Buscar ubicaciones en Valle del Tiétar, Sierra de Gredos..."
            className={`w-full px-4 py-2 text-[rgba(142,133,129)] border rounded-lg text-sm focus:outline-none focus:ring-1 ${
              isValidLocation && event.location
                ? "border-green-500 focus:ring-green-500 focus:border-green-500"
                : locationError
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-[#E5E7EB] focus:ring-[#D45B20] focus:border-[#D45B20]"
            }`}
            required
          />

          {isValidLocation && event.location && (
            <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Ubicación válida seleccionada
            </div>
          )}

          {locationError && (
            <div className="mt-2 text-sm text-red-600">{locationError}</div>
          )}

          {!isValidLocation && !locationError && (
            <div className="mt-2 text-sm text-gray-500">
              Escriba para buscar y seleccione una ubicación de las sugerencias
              de Google Maps
            </div>
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
                  No se han encontrado ubicaciones en las regiones objetivo.
                  Intenta buscar lugares en Valle del Tiétar, La Moraña, Valle
                  de Amblés, Sierra de Gredos, o Alberche Pinares.
                </div>
              </div>
            )}
        </div>
      </div>
      <div>
        <label className="block text-sm font-sm text-[rgba(68,63,63)] mb-1">
          Datos de contacto (visibles para los usuarios)
          <RequiredIndicator />
        </label>
        <div className="space-y-4">
          <input
            type="email"
            name="email"
            value={event.email || ""}
            onChange={onChange}
            placeholder="Dirección de correo electrónico"
            className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
            required
          />{" "}
          <input
            type="tel"
            name="phone"
            value={event.phone || ""}
            onChange={handlePhoneChange}
            placeholder="Número de teléfono"
            className={`w-full px-4 py-2 text-[rgba(142,133,129)] border rounded-lg text-sm focus:outline-none focus:ring-1 ${
              phoneError
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-[#E5E7EB] focus:ring-[#D45B20] focus:border-[#D45B20]"
            }`}
            required={!event.phone && !event.url}
          />{" "}
          {phoneError && (
            <p className="mt-1 text-sm text-red-600">{phoneError}</p>
          )}
          <input
            placeholder="Enlace (página web o redes)"
            type="text"
            name="url"
            value={event.url || ""}
            onChange={handleUrlChange}
            className={`w-full px-4 py-2 text-[rgba(142,133,129)] border rounded-lg text-sm focus:outline-none focus:ring-1 ${
              urlError
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-[#E5E7EB] focus:ring-[#D45B20] focus:border-[#D45B20]"
            }`}
            required={!event.phone && !event.email}
          />
          {urlError && <p className="mt-1 text-sm text-red-600">{urlError}</p>}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[rgba(68,63,63)] mb-2">
          Precio
        </label>
        <textarea
          name="fees"
          value={event.fees || ""}
          onChange={onChange}
          placeholder="Ej. Evento gratuito o 18€ por persona (incluye degustación)"
          rows={3}
          className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[rgba(68,63,63)] mb-2">
          Descripción <RequiredIndicator />
        </label>
        <textarea
          name="description"
          value={event.description || ""}
          onChange={onChange}
          maxLength={1000}
          placeholder="Escribe más sobre el evento, horarios, punto de encuentro o detalles útiles"
          rows={3}
          className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
          required
        />
      </div>{" "}
      <div>
        <label className="block text-sm font-medium text-[rgba(68,63,63)] mb-2">
          Haz clic para subir imágenes o vídeos del evento
        </label>
        <div>
          {previewImages.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-[rgba(68,63,63)] mb-2">
                Images ({currentImageCount}/{MAX_IMAGES})
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {previewImages.map((url, index) => (
                  <div
                    key={`image-${index}`}
                    className="relative group aspect-square rounded-lg overflow-hidden"
                    onMouseEnter={() => setHoverIndex(index)}
                    onMouseLeave={() => setHoverIndex(null)}
                  >
                    {" "}
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
                document.getElementById("event-media")?.click();
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
              id="event-media"
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
                : "Haz clic para subir imágenes o vídeos del evento"}
            </div>
            <p className="text-xs text-[#6B7280] mt-2">
              {uploadError ? (
                <span className="text-red-500">{uploadError}</span>
              ) : (
                `Images: ${currentImageCount}/${MAX_IMAGES} | Videos: ${currentVideoCount}/${MAX_VIDEOS} | Images: Max ${MAX_FILE_SIZE_MB}MB | Videos: Max ${MAX_VIDEO_SIZE_MB}MB`
              )}
            </p>
            <p className="text-xs text-[#6B7280] mt-1">
              Formatos permitidos: JPG, PNG, WebP, MP4, WebM, MOV
            </p>
          </div>
        </div>
      </div>{" "}
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[rgba(68,63,63)]"
          disabled={isLoading}
        >
          Cancelar
        </button>{" "}
        <button
          type="submit"
          disabled={isLoading || !isValidLocation || !event.location}
          className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
            isLoading || !isValidLocation || !event.location
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
            ? event.id
              ? "Actualización..."
              : "Ahorro..."
            : event.id
            ? "Actualizar"
            : "Publicar evento"}
        </button>
      </div>
    </form>
  );
};
