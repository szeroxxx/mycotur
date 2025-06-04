import { useState, useCallback, useEffect } from "react";
import { Activity, Toast, PaginationInfo } from "../types/activity";
import axios from "axios";
import axiosInstance from "../utils/axiosConfig";

const URL = process.env.NEXTAUTH_BACKEND_URL;

interface ApiActivityMedia {
  name: string;
  type: string;
}

interface ApiActivityResponse {
  id: number;
  uuid: string;
  title: string;
  category: string;
  location: string;
  lat: string;
  lon: string;
  startMonth: string | null;
  endMonth: string | null;
  email: string;
  phone: string;
  link: string;
  fees: string;
  description: string;
  media: ApiActivityMedia[];
}

export const useActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    pageSize: 12,
    totalItems: 0,
  });
  const [isLoading, setIsLoading] = useState(false);

  const showToast = useCallback(
    (type: "success" | "error", message: string) => {
      setToast({ type, message });
      setTimeout(() => setToast(null), 3000);
    },
    []
  );
  const fetchActivities = useCallback(
    async (page: number = 1) => {
      try {
        setIsLoading(true);
        const uuid = localStorage.getItem("userUuid");

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: "12", // Use fixed page size to avoid dependency issues
        });

        if (searchTerm) {
          queryParams.append("search", searchTerm);
        }

        if (categoryFilter) {
          queryParams.append("category", categoryFilter);
        }

        if (locationFilter) {
          queryParams.append("location", locationFilter);
        }

        const response = await axiosInstance.get(
          `${URL}/api/activity?${queryParams.toString()}`,
          {
            headers: {
              userid: uuid,
            },
          }
        );
        const mappedActivities: Activity[] = response.data.data.map(
          (item: ApiActivityResponse) => ({
            id: item.id.toString(),
            uuid: item.uuid,
            title: item.title,
            category: item.category,
            location: item.location,
            lat: item.lat,
            lon: item.lon,
            startMonth: item.startMonth?.substring(0, 7) || "",
            endMonth: item.endMonth?.substring(0, 7) || "",
            email: item.email,
            phone: item.phone,
            url: item.link,
            notes: item.fees,
            description: item.description,
            images: [],
            videos: [],
            mediaUrls: item.media,
          })
        );

        setActivities(mappedActivities);
        setPagination(response.data.pagination);
      } catch (error) {
        console.error("Error fetching activities:", error);
        showToast(
          "error",
          error instanceof Error ? error.message : "Failed to fetch activities"
        );
      } finally {
        setIsLoading(false);
      }
    },
    [showToast, searchTerm, categoryFilter, locationFilter]
  );

  const createActivity = useCallback(
    async (
      activity: Omit<Activity, "id"> & { originalActivityId?: string }
    ) => {
      try {
        const formData = new FormData();

        if (activity.images && activity.images.length > 0) {
          const maxSize = 10 * 1024 * 1024; // 10MB
          const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

          for (const image of activity.images) {
            if (!allowedImageTypes.includes(image.type)) {
              showToast("error", "Only JPG, PNG and WebP images are allowed");
              return;
            }
            if (image.size > maxSize) {
              showToast("error", "Images must be less than 10MB");
              return;
            }
          }
        }

        if (activity.videos && activity.videos.length > 0) {
          const maxSize = 15 * 1024 * 1024;
          const allowedVideoTypes = ["video/mp4", "video/webm", "video/mov"];

          for (const video of activity.videos) {
            if (!allowedVideoTypes.includes(video.type)) {
              showToast("error", "Only MP4, WebM and MOV videos are allowed");
              return;
            }
            if (video.size > maxSize) {
              showToast("error", "Videos must be less than 15MB");
              return;
            }
          }
        }

        formData.append("title", activity.title);
        formData.append("category", activity.category);
        formData.append("startMonth", activity.startMonth);
        formData.append("endMonth", activity.endMonth);
        formData.append("phone", activity.phone);
        formData.append("email", activity.email);
        formData.append("link", activity.url);
        formData.append("fees", activity.notes);
        formData.append("description", activity.description);
        formData.append("location", activity.location);
        if (activity.lat) {
          formData.append("lat", activity.lat.toString());
        }
        if (activity.lon) {
          formData.append("lon", activity.lon.toString());
        } // Add originalActivityId if this is a duplicate
        if (activity.originalActivityId) {
          formData.append("originalActivityId", activity.originalActivityId);
        }

        // Add mediaUrls if provided (for duplication with selective media)
        if (activity.mediaUrls && activity.mediaUrls.length > 0) {
          formData.append("mediaUrls", JSON.stringify(activity.mediaUrls));
        }

        if (activity.images && activity.images.length > 0) {
          activity.images.forEach((image) => {
            formData.append("images", image);
          });
        }

        if (activity.videos && activity.videos.length > 0) {
          activity.videos.forEach((video) => {
            formData.append("videos", video);
          });
        }
        const uuid = localStorage.getItem("userUuid");

        const response = await axiosInstance.post(
          `${URL}/api/activity`,
          formData,
          {
            headers: {
              userid: uuid,
            },
          }
        );

        if (response.status === 201) {
          const newActivity = {
            ...activity,
            id: response.data.id,
          };
          showToast("success", "Activity created successfully");
          await fetchActivities(1);
          return newActivity;
        }
      } catch (error) {
        let errorMessage = "Failed to create activity";
        if (axios.isAxiosError(error)) {
          errorMessage = error.response?.data?.message || error.message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }
        showToast("error", errorMessage);
      }
    },
    [showToast, fetchActivities]
  );

  const updateActivity = useCallback(
    async (activity: Activity) => {
      try {
        const formData = new FormData();

        if (activity.images && activity.images.length > 0) {
          const maxSize = 15 * 1024 * 1024; // 15MB
          const allowedImageTypes = ["image/jpeg", "image/png", "image/webp"];

          for (const image of activity.images) {
            if (!allowedImageTypes.includes(image.type)) {
              showToast("error", "Only JPG, PNG and WebP images are allowed");
              return;
            }
            if (image.size > maxSize) {
              showToast("error", "Images must be less than 15MB");
              return;
            }
          }
        }

        if (activity.videos && activity.videos.length > 0) {
          const maxSize = 15 * 1024 * 1024; // 15MB
          const allowedVideoTypes = ["video/mp4", "video/webm", "video/mov"];

          for (const video of activity.videos) {
            if (!allowedVideoTypes.includes(video.type)) {
              showToast("error", "Only MP4, WebM and MOV videos are allowed");
              return;
            }
            if (video.size > maxSize) {
              showToast("error", "Videos must be less than 15MB");
              return;
            }
          }
        }

        formData.append("title", activity.title);
        formData.append("category", activity.category);
        formData.append("startMonth", activity.startMonth);
        formData.append("endMonth", activity.endMonth);
        formData.append("phone", activity.phone);
        formData.append("email", activity.email);
        formData.append("link", activity.url);
        formData.append("fees", activity.notes);
        formData.append("description", activity.description);
        formData.append("location", activity.location);
        if (activity.lat) {
          formData.append("lat", activity.lat.toString());
        }
        if (activity.lon) {
          formData.append("lon", activity.lon.toString());
        }

        if (activity.mediaUrls && activity.mediaUrls.length > 0) {
          formData.append("mediaUrls", JSON.stringify(activity.mediaUrls));
        }

        if (activity.images && activity.images.length > 0) {
          activity.images.forEach((image) => {
            if (image instanceof File) {
              formData.append("images", image);
            }
          });
        }

        if (activity.videos && activity.videos.length > 0) {
          activity.videos.forEach((video) => {
            if (video instanceof File) {
              formData.append("videos", video);
            }
          });
        }
        const response = await axiosInstance.put(
          `${URL}/api/activity/${activity.id}`,
          formData,
          {
            timeout: 60000,
          }
        );
        if (response.status === 200) {
          showToast("success", "Activity updated successfully");
          await fetchActivities(pagination.currentPage);
          return activity;
        }
        showToast("error", "Failed to update activity");
      } catch (error) {
        console.error("Error updating activity:", error);
        let errorMessage = "Failed to update activity";
        if (axios.isAxiosError(error)) {
          errorMessage = error.response?.data?.message || error.message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        showToast("error", errorMessage);
        throw error;
      }
    },
    [showToast, fetchActivities, pagination.currentPage]
  );

  const deleteActivity = useCallback(
    async (id: string) => {
      try {
        const token = localStorage.getItem("token");
        const config = {
          method: "delete",
          url: `${URL}/api/activity/${id}`,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const response = await axiosInstance.request(config);

        if (response.status === 200) {
          showToast("success", "Activity deleted successfully");
          await fetchActivities(pagination.currentPage);
        } else {
          throw new Error(
            response.data?.message || "Failed to delete activity"
          );
        }
      } catch (error) {
        console.error("Error deleting activity:", error);
        let errorMessage = "Failed to delete activity";

        if (axios.isAxiosError(error)) {
          errorMessage = error.response?.data?.message || error.message;
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        showToast("error", errorMessage);
        throw error;
      }
    },
    [showToast, fetchActivities, pagination.currentPage]
  );

  const fetchAllActivities = useCallback(async () => {
    try {
      const uuid = localStorage.getItem("userUuid");
      const token = localStorage.getItem("token");
      const config = {
        method: "get",
        url: `${URL}/api/activity?limit=1000`,
        headers: {
          Authorization: `Bearer ${token}`,
          userid: uuid,
        },
      };

      const response = await axiosInstance.request(config);
      return response.data.data.map((item: ApiActivityResponse) => ({
        id: item.id.toString(),
        title: item.title,
        category: item.category,
        location: item.location,
        startMonth: item.startMonth?.substring(0, 7) || "",
        endMonth: item.endMonth?.substring(0, 7) || "",
        email: item.email,
        phone: item.phone,
        url: item.link,
        notes: item.fees,
        description: item.description,
        images: [],
        videos: [],
        mediaUrls: Array.isArray(item.media)
          ? item.media.map((m: ApiActivityMedia) => ({
              name: m.name,
              type: m.type,
            }))
          : [],
      }));
    } catch (error) {
      console.error("Error fetching all activities:", error);
      throw error;
    }
  }, []);
  const setPage = useCallback(
    (page: number) => {
      fetchActivities(page);
    },
    [fetchActivities]
  );

  const handleSearchChange = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleCategoryFilterChange = useCallback((category: string) => {
    setCategoryFilter(category);
  }, []);
  const handleLocationFilterChange = useCallback((location: string) => {
    setLocationFilter(location);
  }, []);

  // Initial load
  useEffect(() => {
    fetchActivities(1);
  }, []);

  // Refetch when filters change
  useEffect(() => {
    if (searchTerm || categoryFilter || locationFilter) {
      fetchActivities(1);
    }
  }, [searchTerm, categoryFilter, locationFilter, fetchActivities]);
  return {
    activities: activities,
    pagination,
    toast,
    searchTerm,
    categoryFilter,
    locationFilter,
    setSearchTerm: handleSearchChange,
    setCategoryFilter: handleCategoryFilterChange,
    setLocationFilter: handleLocationFilterChange,
    setPage,
    createActivity,
    updateActivity,
    deleteActivity,
    showToast,
    isLoading,
    fetchAllActivities,
  };
};
