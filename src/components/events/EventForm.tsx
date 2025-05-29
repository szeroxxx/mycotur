import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Event } from "../../types/event";
import { Activity } from "../../types/activity";
import { MdDelete, MdPlayCircle } from "react-icons/md";
import { getMediaUrl } from "../../utils/mediaHelpers";

const MAX_FILE_SIZE_MB = 10;
const MAX_IMAGES = 10;
const MAX_VIDEOS = 3;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/mov"];

interface LocationSuggestion {
  display_name: string;
  display_place: string;
  display_address: string;
  place_id: string;
  lat: string;
  lon: string;
  address: {
    name: string;
    state?: string;
    country?: string;
    city?: string;
  };
}

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
}

const RequiredIndicator = () => (
  <span className="text-[rgba(220,38,38,1)]">*</span>
);

const LOCATIONIQ_API_KEY = "pk.bd1aad9ddb52d668b4630b31292a59b6";
const LOCATIONIQ_API_URL = "https://api.locationiq.com/v1/autocomplete";

export const EventForm: React.FC<EventFormProps> = ({
  event,
  categories,
  onSubmit,
  onChange,
  onCancel,
  activities,
  onActivitySelect,
}) => {
  const [locationInput, setLocationInput] = useState(event.location || "");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewVideos, setPreviewVideos] = useState<string[]>([]);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverVideoIndex, setHoverVideoIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const logMediaState = (action: string) => {
    console.log(`--- ${action} ---`);
    console.log("Current images:", event.images?.length || 0);
    console.log("Current videos:", event.videos?.length || 0);
    console.log("Current mediaUrls:", event.mediaUrls?.length || 0);
    console.log(
      "MediaUrls images:",
      event.mediaUrls?.filter((m) => m.type.startsWith("image")).length || 0
    );
    console.log(
      "MediaUrls videos:",
      event.mediaUrls?.filter((m) => m.type.startsWith("video")).length || 0
    );
    console.log("Preview images:", previewImages.length);
    console.log("Preview videos:", previewVideos.length);
    console.log("--- End ---");
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

      // // Auto-fill event name if available
      // if (selectedActivity.title) {
      //   onChange({
      //     ...e,
      //     target: {
      //       ...e.target,
      //       name: "event",
      //       value: selectedActivity.title,
      //     },
      //   } as React.ChangeEvent<HTMLSelectElement>);
      // }

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
    setLocationInput(value);
    onChange(e);
    if (value.length > 2) {
      try {
        const response = await fetch(
          `${LOCATIONIQ_API_URL}?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(
            value
          )}&limit=5&dedupe=1`
        );

        if (!response.ok) {
          if (response.status === 404) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
          }
        }

        const data = await response.json();
        console.log("data::: ", data);
        setSuggestions(data);
        setShowSuggestions(data.length > 0);
      } catch (error) {
        console.error("Error fetching locations:", error);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
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
  };
  const handleImageRemove = (index: number) => {
    try {
      const totalImageCount = previewImages.length;
      if (index < 0 || index >= totalImageCount) {
        console.error(
          "Invalid image index:",
          index,
          "Total images:",
          totalImageCount
        );
        setUploadError("Invalid image selection. Please try again.");
        return;
      }
      const currentImages = [...(event.images || [])];
      const currentMediaUrls = [...(event.mediaUrls || [])];
      const existingImages = currentMediaUrls.filter((media) =>
        media.type.startsWith("image")
      );
      const existingImageCount = existingImages.length;

      console.log("State analysis:");
      console.log("- Existing saved images:", existingImageCount);
      console.log("- New uploaded images:", currentImages.length);
      console.log("- Total preview images:", totalImageCount);
      console.log("- Index to remove:", index);

      if (index < existingImageCount) {
        // Removing an existing saved image
        console.log("🔴 Removing EXISTING image at index:", index);
        const imageToRemove = existingImages[index];
        console.log("Image to remove:", imageToRemove);

        // Create new array without the removed image
        const updatedMediaUrls = currentMediaUrls.filter((media) => {
          if (media.type.startsWith("image")) {
            const shouldKeep = !(
              media.name === imageToRemove.name &&
              media.type === imageToRemove.type
            );
            if (!shouldKeep) {
              console.log("Removing from mediaUrls:", media);
            }
            return shouldKeep;
          }
          return true; // Keep all non-image media
        });

        console.log(
          "Updated mediaUrls count:",
          updatedMediaUrls.length,
          "vs original:",
          currentMediaUrls.length
        );

        // Update only mediaUrls array
        const mediaEvent = {
          target: {
            name: "mediaUrls",
            value: updatedMediaUrls,
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange(mediaEvent);
      } else {
        // Removing a newly uploaded image
        const newImageIndex = index - existingImageCount;
        console.log("🟡 Removing NEW image at adjusted index:", newImageIndex);

        if (newImageIndex >= 0 && newImageIndex < currentImages.length) {
          const updatedImages = currentImages.filter((_, idx) => {
            const shouldKeep = idx !== newImageIndex;
            if (!shouldKeep) {
              console.log("Removing from images array at index:", idx);
            }
            return shouldKeep;
          });

          console.log(
            "Updated images count:",
            updatedImages.length,
            "vs original:",
            currentImages.length
          );

          // Update only images array
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
          setUploadError("Failed to remove image. Invalid selection.");
          return;
        }
      }

      setUploadError(null);
      console.log("✅ Image removal completed successfully");
    } catch (error) {
      console.error("❌ Error in handleImageRemove:", error);
      setUploadError("Failed to remove image. Please try again.");
    }
  };
  const handleVideoRemove = (index: number) => {
    console.log("=== REMOVING VIDEO AT INDEX:", index, "===");
    logMediaState("Before video removal");

    try {
      // Validate index
      const totalVideoCount = previewVideos.length;
      if (index < 0 || index >= totalVideoCount) {
        console.error(
          "Invalid video index:",
          index,
          "Total videos:",
          totalVideoCount
        );
        setUploadError("Invalid video selection. Please try again.");
        return;
      }

      // Create defensive copies
      const currentVideos = [...(event.videos || [])];
      const currentMediaUrls = [...(event.mediaUrls || [])];

      // Get existing videos from mediaUrls (these are already saved videos)
      const existingVideos = currentMediaUrls.filter((media) =>
        media.type.startsWith("video")
      );
      const existingVideoCount = existingVideos.length;

      console.log("Video state analysis:");
      console.log("- Existing saved videos:", existingVideoCount);
      console.log("- New uploaded videos:", currentVideos.length);
      console.log("- Total preview videos:", totalVideoCount);
      console.log("- Index to remove:", index);

      if (index < existingVideoCount) {
        // Removing an existing saved video
        console.log("🔴 Removing EXISTING video at index:", index);
        const videoToRemove = existingVideos[index];
        console.log("Video to remove:", videoToRemove);

        // Create new array without the removed video
        const updatedMediaUrls = currentMediaUrls.filter((media) => {
          if (media.type.startsWith("video")) {
            const shouldKeep = !(
              media.name === videoToRemove.name &&
              media.type === videoToRemove.type
            );
            if (!shouldKeep) {
              console.log("Removing from mediaUrls:", media);
            }
            return shouldKeep;
          }
          return true; // Keep all non-video media
        });

        console.log(
          "Updated mediaUrls count:",
          updatedMediaUrls.length,
          "vs original:",
          currentMediaUrls.length
        );

        // Update only mediaUrls array
        const mediaEvent = {
          target: {
            name: "mediaUrls",
            value: updatedMediaUrls,
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange(mediaEvent);
      } else {
        // Removing a newly uploaded video
        const newVideoIndex = index - existingVideoCount;
        console.log("🟡 Removing NEW video at adjusted index:", newVideoIndex);

        if (newVideoIndex >= 0 && newVideoIndex < currentVideos.length) {
          const updatedVideos = currentVideos.filter((_, idx) => {
            const shouldKeep = idx !== newVideoIndex;
            if (!shouldKeep) {
              console.log("Removing from videos array at index:", idx);
            }
            return shouldKeep;
          });

          console.log(
            "Updated videos count:",
            updatedVideos.length,
            "vs original:",
            currentVideos.length
          );

          // Update only videos array
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
          setUploadError("Failed to remove video. Invalid selection.");
          return;
        }
      }

      setUploadError(null);
      console.log("✅ Video removal completed successfully");
    } catch (error) {
      console.error("❌ Error in handleVideoRemove:", error);
      setUploadError("Failed to remove video. Please try again.");
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
          setUploadError(`Image ${file.name} exceeds 10MB limit`);
          return;
        }
        imageFiles.push(file);
      } else if (ALLOWED_VIDEO_TYPES.includes(file.type)) {
        if (file.size > 15 * 1024 * 1024) {
          setUploadError(`Video ${file.name} exceeds 15MB limit`);
          return;
        }
        videoFiles.push(file);
      } else {
        setUploadError(
          `File ${file.name} is not allowed. Only JPG, PNG, WebP images and MP4, WebM, MOV videos are supported.`
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
        `Too many images. Maximum ${MAX_IMAGES} images allowed. You can upload ${
          remaining > 0 ? remaining : "no"
        } more image${remaining !== 1 ? "s" : ""}.`
      );
      return;
    }

    if (totalVideos + videoFiles.length > MAX_VIDEOS) {
      const remaining = MAX_VIDEOS - totalVideos;
      setUploadError(
        `Too many videos. Maximum ${MAX_VIDEOS} videos allowed. You can upload ${
          remaining > 0 ? remaining : "no"
        } more video${remaining !== 1 ? "s" : ""}.`
      );
      return;
    }

    for (const file of newFiles) {
      if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setUploadError(`Files must be less than ${MAX_FILE_SIZE_MB}MB`);
        return;
      }
    }
    setIsUploading(true);
    try {
      console.log("📁 Processing media upload...");
      logMediaState("Before upload");

      // Update images if any
      if (imageFiles.length > 0) {
        const updatedImages = [...existingImages, ...imageFiles];
        console.log(
          "Adding",
          imageFiles.length,
          "new images. Total will be:",
          updatedImages.length
        );

        const imageEvent = {
          target: {
            name: "images",
            value: updatedImages,
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange(imageEvent);
      }

      // Update videos if any
      if (videoFiles.length > 0) {
        const updatedVideos = [...existingVideos, ...videoFiles];
        console.log(
          "Adding",
          videoFiles.length,
          "new videos. Total will be:",
          updatedVideos.length
        );

        const videoEvent = {
          target: {
            name: "videos",
            value: updatedVideos,
          },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange(videoEvent);
      }

      console.log("✅ Media upload processing completed");
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
  }, []);
  useEffect(() => {
    console.log("🔄 Regenerating preview arrays...");
    logMediaState("Before preview regeneration");

    // Clean up previous URLs
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

    // Process existing media URLs first
    if (event.mediaUrls && event.mediaUrls.length > 0) {
      const imageMedias = event.mediaUrls.filter((media) =>
        media.type.startsWith("image")
      );
      const existingImageUrls = imageMedias.map((media) => {
        const url = getMediaUrl(media.name);
        console.log("Adding existing image URL:", url);
        return url;
      });

      const videoMedias = event.mediaUrls.filter((media) =>
        media.type.startsWith("video")
      );

      const existingVideoUrls = videoMedias.map((media) => {
        const url = getMediaUrl(media.name);
        console.log("Adding existing video URL:", url);
        return url;
      });

      newPreviewImages.push(...existingImageUrls);
      newPreviewVideos.push(...existingVideoUrls);
    }

    // Process new uploaded files
    if (event.images && event.images.length > 0) {
      const fileUrls = event.images.map((file) => {
        const url = URL.createObjectURL(file);
        console.log("Adding new image blob URL:", url);
        return url;
      });
      newPreviewImages.push(...fileUrls);
    }

    if (event.videos && event.videos.length > 0) {
      const videoUrls = event.videos.map((file) => {
        const url = URL.createObjectURL(file);
        console.log("Adding new video blob URL:", url);
        return url;
      });
      newPreviewVideos.push(...videoUrls);
    }

    console.log(
      "Final preview arrays - Images:",
      newPreviewImages.length,
      "Videos:",
      newPreviewVideos.length
    );

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

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-[rgba(68,63,63)] mb-2">
          Fetch data direct from activity details(optional)
        </label>{" "}
        <select
          name="activityName"
          value={event.activityId?.toString() || ""}
          onChange={handleAutoFillActivitySelect}
          className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
        >
          <option value="">Select your Activity</option>
          {activities.map((activity) => (
            <option key={activity.id} value={activity.id.toString()}>
              {activity.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-[rgba(68,63,63)] mb-2">
          Select Activity <RequiredIndicator />
        </label>{" "}
        <select
          name="activityId"
          value={event.activityId?.toString() || ""}
          onChange={handleRegularActivitySelect}
          className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
          required
        >
          <option value="">Select your Activity</option>
          {activities.map((activity) => (
            <option key={activity.id} value={activity.id.toString()}>
              {activity.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-[rgba(68,63,63)] mb-2">
          Event Title <RequiredIndicator />
        </label>
        <input
          type="text"
          name="event"
          value={event.event || ""}
          onChange={onChange}
          placeholder="Event name"
          className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[rgba(68,63,63)] mb-2">
            Event Date <RequiredIndicator />
          </label>{" "}
          <input
            type="date"
            name="eventDate"
            value={
              event.eventDate
                ? new Date(event.eventDate).toISOString().split("T")[0]
                : ""
            }
            onChange={onChange}
            className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[rgba(68,63,63)] mb-2">
            Event Time <RequiredIndicator />
          </label>{" "}
          <input
            type="time"
            name="eventTime"
            value={
              event.eventTime
                ? new Date(`2000-01-01 ${event.eventTime}`).toLocaleTimeString(
                    "en-US",
                    { hour12: false, hour: "2-digit", minute: "2-digit" }
                  )
                : ""
            }
            onChange={onChange}
            className="w-full px-4 py-2 border text-[rgba(142,133,129)] border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
            required
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[rgba(68,63,63)] mb-2">
          Event Category <RequiredIndicator />
        </label>
        <select
          name="category"
          value={event.category || ""}
          onChange={onChange}
          className="w-full px-4 py-2 border text-[rgba(142,133,129)] border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
          required
        >
          <option value="">Select Category</option>
          {categories.map((category) => (
            <option key={category.uuid} value={category.title}>
              {category.title}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-sm text-[rgba(68,63,63)] mb-2">
          Location <RequiredIndicator />
        </label>
        <div className="relative" ref={locationRef}>
          <input
            type="text"
            name="location"
            value={locationInput}
            onChange={handleLocationChange}
            placeholder="Enter location"
            className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
            required
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion) => (
                <div
                  key={suggestion.place_id}
                  className="px-4 py-2 hover:bg-[#FFF5F1] cursor-pointer"
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
        </div>
      </div>
      <div>
        <label className="block text-sm font-sm text-[rgba(68,63,63)] mb-1">
          Contact Information (People can view this detail)
          <RequiredIndicator />
        </label>
        <div className="space-y-4">
          <input
            type="email"
            name="email"
            value={event.email || ""}
            onChange={onChange}
            placeholder="Email address"
            className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
            required
          />
          <input
            type="tel"
            name="phone"
            value={event.phone || ""}
            onChange={onChange}
            placeholder="Phone number"
            className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
            required={!event.phone && !event.url}
          />
          <input
            placeholder="Enter link"
            type="text"
            name="url"
            value={event.url || ""}
            onChange={onChange}
            className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
            required={!event.phone && !event.email}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[rgba(68,63,63)] mb-2">
          Fees
        </label>
        <textarea
          name="fees"
          value={event.fees || ""}
          onChange={onChange}
          placeholder="Maximum if there are any fees involved, such as a $50 charge per person covering food and all activities"
          rows={3}
          className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[rgba(68,63,63)] mb-2">
          Description <RequiredIndicator />
        </label>
        <textarea
          name="description"
          value={event.description || ""}
          onChange={onChange}
          maxLength={1000}
          placeholder="Write more details about the event"
          rows={3}
          className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
          required
        />
      </div>{" "}
      <div>
        <label className="block text-sm font-medium text-[rgba(68,63,63)] mb-2">
          Event Images & Videos
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
                      aria-label="Remove image"
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
          )}
          <div
            className={`border-2 border-dashed border-[#E5E7EB] rounded-lg p-8 text-center transition-colors
            ${isUploading ? "bg-gray-50" : "hover:border-[#D45B20]"}`}
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
            <label
              htmlFor="activity-media"
              className={`cursor-pointer text-sm ${
                isUploading
                  ? "text-gray-400"
                  : "text-[#6B7280] hover:text-[#D45B20]"
              }`}
            >
              {isUploading
                ? "Uploading..."
                : "Click to upload images and videos"}
            </label>
            <p className="text-xs text-[#6B7280] mt-2">
              {uploadError ? (
                <span className="text-red-500">{uploadError}</span>
              ) : (
                `Images: ${currentImageCount}/${MAX_IMAGES} | Videos: ${currentVideoCount}/${MAX_VIDEOS} | Max ${MAX_FILE_SIZE_MB}MB each`
              )}
            </p>
            <p className="text-xs text-[#6B7280] mt-1">
              Supported: JPG, PNG, WebP, MP4, WebM, MOV
            </p>
          </div>
        </div>
      </div>
      <div className="flex justify-end space-x-4 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-[#6B7280] hover:text-[rgba(68,63,63)]"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-[#D45B20] hover:bg-[#C44D16] text-white rounded-lg text-sm font-medium transition-colors"
        >
          {event.id ? "Update" : "Save"}
        </button>
      </div>
    </form>
  );
};
