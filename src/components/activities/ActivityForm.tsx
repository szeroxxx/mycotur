import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Activity } from "../../types/activity";
import { MdDelete, MdPlayCircle } from "react-icons/md";
import { getMediaUrl } from "../../utils/mediaHelpers";
import {
  googlePlacesService,
  LocationSuggestion,
} from "../../utils/googlePlacesService";

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
}) => {
  const [locationInput, setLocationInput] = useState(activity.location || "");
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [previewVideos, setPreviewVideos] = useState<string[]>([]);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [hoverVideoIndex, setHoverVideoIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleLocationChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setLocationInput(value);
    onChange(e);

    if (value.length > 2) {
      try {
        const suggestions = await googlePlacesService.searchPlaces(value);
        setSuggestions(suggestions);
        setShowSuggestions(suggestions.length > 0);
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
      setUploadError("Failed to remove image. Please try again.");
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
      // Update images if any
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

      // Update videos if any
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

  const currentImageCount =
    (activity.images?.length || 0) +
    (activity.mediaUrls?.filter((media) => media.type.startsWith("image"))
      .length || 0);
  const currentVideoCount =
    (activity.videos?.length || 0) +
    (activity.mediaUrls?.filter((media) => media.type.startsWith("video"))
      .length || 0);

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-sm text-[rgba(68,63,63)] mb-2">
          Activity Title <RequiredIndicator />
        </label>
        <input
          placeholder="Activity Name"
          type="text"
          name="title"
          value={activity.title || ""}
          onChange={onChange}
          className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-sm text-[rgba(68,63,63)] mb-2">
          Activity Category <RequiredIndicator />
        </label>
        <select
          name="category"
          value={activity.category || ""}
          onChange={onChange}
          className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
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
            placeholder="Enter location (e.g., Valle del Tiétar, Sierra de Gredos...)"
            className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
            required
          />
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
                  No locations found in target regions. Try searching for places
                  in Valle del Tiétar, La Moraña, Valle de Amblés, Sierra de
                  Gredos, or Alberche Pinares.
                </div>
              </div>
            )}
        </div>
      </div>

      <div className="w-full max-w-2xl">
        <div className="mb-4">
          <p className="text-[rgba(68,63,63)] text-sm mb-4 font-sm">
            Which season do you think is best for this activity?{" "}
            <RequiredIndicator />
          </p>

          <div className="flex gap-4">
            <div className="w-full">
              <label className="block text-sm font-sm text-[rgba(142,133,129)] mb-2">
                Start Month
              </label>
              <input
                type="month"
                name="startMonth"
                value={activity.startMonth || ""}
                onChange={onChange}
                required
                className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
              />
            </div>

            <div className="w-full">
              <label className="block text-sm font-sm text-[rgba(142,133,129)] mb-2">
                End Month
              </label>
              <input
                type="month"
                name="endMonth"
                value={activity.endMonth || ""}
                onChange={onChange}
                required
                className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
              />
            </div>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-sm text-[rgba(68,63,63)] mb-1">
          Contact Information (People can view this detail)
          <RequiredIndicator />
        </label>
        <div className="space-y-4">
          <input
            type="tel"
            name="phone"
            value={activity.phone || ""}
            onChange={onChange}
            placeholder="Phone number"
            className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
            required
          />
          <input
            type="email"
            name="email"
            value={activity.email || ""}
            onChange={onChange}
            placeholder="Email address"
            className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
            required={!activity.phone && !activity.url}
          />
          <input
            placeholder="Enter link"
            type="text"
            name="url"
            value={activity.url || ""}
            onChange={onChange}
            className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
            required={!activity.phone && !activity.email}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-[rgba(68,63,63)] mb-2">
          Fees
          <RequiredIndicator />
        </label>
        <textarea
          name="notes"
          value={activity.notes || ""}
          onChange={onChange}
          placeholder="Mention if there are any fees involved, such as a $20 charge per person covering food and all activities"
          rows={3}
          required
          className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[rgba(68,63,63)] mb-2">
          Description <RequiredIndicator />
        </label>
        <textarea
          name="description"
          value={activity.description || ""}
          onChange={onChange}
          placeholder="Write more details Activity and how people can connect you."
          rows={3}
          maxLength={1000}
          className="w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20]"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-[rgba(68,63,63)] mb-2">
          Activity Images & Videos
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
          {activity.id ? "Update" : "Save"}
        </button>
      </div>
    </form>
  );
};
