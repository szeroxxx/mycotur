import { useState, useCallback, useEffect } from "react";
import { Event, Toast, PaginationInfo } from "../types/event";
import axios from "axios";
import axiosInstance from "../utils/axiosConfig";

const ITEMS_PER_PAGE = 10;
const MAX_FILE_SIZE_MB = 5;
const ALLOWED_FILE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/mov"];
const MAX_VIDEO_SIZE_MB = 15;

const URL = process.env.NEXTAUTH_BACKEND_URL;

interface ApiActivityOption {
  id: number;
  title: string;
}

interface ApiEventItem {
  id: number;
  uuid: string;
  title: string;
  activityId: number;
  activityTitle: string;
  category: string;
  location: string;
  date: string;
  time: string;
  description: string;
  capacity: number;
  isPublic: boolean;
  email: string;
  phone: string;
  link: string;
  fees: string;
  media?: Array<{ name: string; type: string }>;
}


export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 1,
    pageSize: ITEMS_PER_PAGE,
    totalItems: 0,
  });
  const [activities, setActivities] = useState<{ id: string; title: string }[]>(
    []
  );
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback(
    (type: "success" | "error", message: string) => {
      setToast({ type, message });
      setTimeout(() => setToast(null), 3000);
    },
    []
  );

  const loadActivities = useCallback(async () => {
    try {
      const uuid = localStorage.getItem("userUuid");

      const response = await axiosInstance.get(`${URL}/api/activity`, {
        headers: {
          userid: uuid,
        },
      });
      if (response.status === 200 && response.data.data) {
        const activityOptions = response.data.data.map(
          (item: ApiActivityOption) => ({
            id: item.id.toString(),
            title: item.title,
          })
        );
        setActivities(activityOptions);
      }
    } catch (error) {
      console.error("Error fetching activities for dropdown:", error);
    }
  }, []);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const fetchEvents = useCallback(
    async (page = 1) => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No authentication token found");
          return;
        }

        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: ITEMS_PER_PAGE.toString(),
        });

        if (searchTerm) {
          queryParams.append("search", searchTerm);
        }        if (categoryFilter) {
          queryParams.append("category", categoryFilter);
        }

        if (locationFilter) {
          queryParams.append("location", locationFilter);
        }
        const uuid = localStorage.getItem("userUuid");
        const response = await axiosInstance.get(
          `${URL}/api/event?${queryParams.toString()}`,
          {
            headers: {
              userid: uuid,
            },
          }
        );

        if (response.data && Array.isArray(response.data.data)) {
          const fetchedEvents: Event[] = response.data.data.map(
            (item: ApiEventItem) => ({
              id: item.uuid,
              activityName: item.activityTitle,
              activityId: item.activityId.toString(),
              event: item.title,
              location: item.location,
              eventDate: item.date,
              eventTime: item.time,
              category: item.category,
              description: item.description,
              email: item.email,
              phone: item.phone,
              url: item.link,
              fees: item.fees,
              images: [],
              videos: [],
              mediaUrls: item.media,
            })
          );

          setEvents(fetchedEvents);
          if (response.data.pagination) {
            setPagination({
              currentPage: response.data.pagination.currentPage,
              totalPages: response.data.pagination.totalPages,
              pageSize: response.data.pagination.itemsPerPage,
              totalItems: response.data.pagination.totalItems,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching events:", error);
        let errorMessage = "Failed to fetch events";

        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            errorMessage = "Authentication failed. Please log in again.";
          } else {
            errorMessage =
              error.response?.data?.message ||
              error.message ||
              "Error connecting to server";
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        showToast("error", errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [showToast, searchTerm, categoryFilter, locationFilter]
  );
  useEffect(() => {
    fetchEvents(1);
  }, [fetchEvents, searchTerm, categoryFilter, locationFilter]);

  const createEvent = useCallback(
    async (event: Omit<Event, "id">) => {
      try {
        const formData = new FormData();        if (
          !event.event ||
          !event.category ||
          !event.email ||
          !event.activityId
        ) {
          showToast("error", "Please fill in all required fields");
          return null;
        }

        if (event.images && event.images.length > 0) {
          for (const image of event.images) {
            if (!ALLOWED_FILE_TYPES.includes(image.type)) {
              showToast("error", "Only JPG, PNG and WebP images are allowed");
              return null;
            }
            if (image.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
              showToast(
                "error",
                `Images must be less than ${MAX_FILE_SIZE_MB}MB`
              );
              return null;
            }
            formData.append("images", image);
          }
        }

        if (event.videos && event.videos.length > 0) {
          for (const video of event.videos) {
            if (!ALLOWED_VIDEO_TYPES.includes(video.type)) {
              showToast("error", "Only MP4, WebM and MOV videos are allowed");
              return null;
            }
            if (video.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
              showToast(
                "error",
                `Videos must be less than ${MAX_VIDEO_SIZE_MB}MB`
              );
              return null;
            }
            formData.append("videos", video);
          }
        }

        formData.append("activityId", event.activityId.toString());
        formData.append("title", event.event);
        formData.append("category", event.category);
        formData.append("date", event.eventDate);
        formData.append("time", event.eventTime);
        formData.append("description", event.description);
        formData.append("email", event.email);
        formData.append("phone", event.phone);
        formData.append("link", event.url);
        formData.append("fees", event.fees);
        formData.append("location", event.location || "");
        if (event.lat) {
          formData.append("lat", event.lat.toString());
        }
        if (event.lon) {
          formData.append("lon", event.lon.toString());
        }
        const uuid = localStorage.getItem("userUuid");
        const response = await axiosInstance.post(
          `${URL}/api/event`,
          formData,
          {
            headers: {
              userid: uuid,
            },
          }
        );

        if (response.status === 200) {
          const newEvent = {
            ...event,
            id: response.data.id,
          };
          showToast("success", "Event created successfully");
          fetchEvents(pagination.currentPage);

          return newEvent;
        } else {
          const errorMessage =
            response.data?.message || "Failed to create event";
          showToast("error", errorMessage);
          return null;
        }
      } catch (error) {
        console.error("Error creating event:", error);
        let errorMessage = "Failed to create event";

        if (axios.isAxiosError(error)) {
          if (error.response?.status === 401) {
            errorMessage = "Authentication failed. Please log in again.";
          } else if (error.response?.status === 400) {
            errorMessage =
              error.response.data?.message ||
              "Invalid input data. Please check your form.";
          } else if (error.response?.status === 403) {
            errorMessage = "You don't have permission to create events.";
          } else if (error.response?.status === 500) {
            errorMessage = "Server error. Please try again later.";
          } else {
            errorMessage =
              error.response?.data?.message ||
              error.message ||
              "Error connecting to server";
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        showToast("error", errorMessage);
        return null;
      }
    },
    [showToast, fetchEvents, pagination.currentPage]
  );
  const deleteEvent = useCallback(
    async (id: string) => {
      try {
        const response = await axiosInstance.delete(`${URL}/api/event/${id}`);

        if (response.status === 200) {
          showToast("success", "Event deleted successfully");
          fetchEvents(pagination.currentPage);
        } else {
          throw new Error(response.data?.message || "Failed to delete event");
        }
      } catch (error) {
        console.error("Error deleting event:", error);
        let errorMessage = "Failed to delete event";

        if (axios.isAxiosError(error)) {
          if (error.response?.status === 404) {
            errorMessage = "Event not found";
          } else if (error.response?.status === 401) {
            errorMessage = "Authentication failed. Please log in again.";
          } else if (error.response?.status === 403) {
            errorMessage = "You don't have permission to delete this event.";
          } else {
            errorMessage = error.response?.data?.message || error.message;
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        showToast("error", errorMessage);
        throw error;
      }
    },
    [showToast, fetchEvents, pagination.currentPage]
  );

  const updateEvent = useCallback(
    async (event: Event) => {
      try {
        const formData = new FormData();        if (event.images && event.images.length > 0) {
          for (const image of event.images) {
            if (!ALLOWED_FILE_TYPES.includes(image.type)) {
              showToast("error", "Only JPG, PNG and WebP images are allowed");
              return null;
            }
            if (image.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
              showToast(
                "error",
                `Images must be less than ${MAX_FILE_SIZE_MB}MB`
              );
              return null;
            }
            formData.append("images", image);
          }
        }

        if (event.videos && event.videos.length > 0) {
          for (const video of event.videos) {
            if (!ALLOWED_VIDEO_TYPES.includes(video.type)) {
              showToast("error", "Only MP4, WebM and MOV videos are allowed");
              return null;
            }
            if (video.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
              showToast(
                "error",
                `Videos must be less than ${MAX_VIDEO_SIZE_MB}MB`
              );
              return null;
            }
            formData.append("videos", video);
          }
        }

        formData.append("activityId", event.activityId.toString());
        formData.append("title", event.event);
        formData.append("category", event.category);
        formData.append("date", event.eventDate);
        formData.append("time", event.eventTime);
        formData.append("description", event.description);
        formData.append("email", event.email);
        formData.append("phone", event.phone || "");
        formData.append("link", event.url || "");
        formData.append("fees", event.fees);
        formData.append("location", event.location || "");
        if (event.lat) {
          formData.append("lat", event.lat.toString());
        }        if (event.lon) {
          formData.append("lon", event.lon.toString());
        }
        if (event.mediaUrls && event.mediaUrls.length > 0) {
          formData.append("mediaUrls", JSON.stringify(event.mediaUrls));
        }
        
        const response = await axiosInstance.put(
          `${URL}/api/event/${event.id}`,
          formData
        );

        if (response.status === 200) {
          showToast("success", "Event updated successfully");
          fetchEvents(pagination.currentPage);

          return event;
        } else {
          const errorMessage =
            response.data?.message || "Failed to update event";
          showToast("error", errorMessage);
          return null;
        }
      } catch (error) {
        console.error("Error updating event:", error);
        let errorMessage = "Failed to update event";

        if (axios.isAxiosError(error)) {
          errorMessage =
            error.response?.data?.message ||
            error.message ||
            "Error connecting to server";
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        showToast("error", errorMessage);
        return null;
      }
    },
    [showToast, fetchEvents, pagination.currentPage]
  );

  const setPage = useCallback(
    (page: number) => {
      setPagination((prev) => ({
        ...prev,
        currentPage: page,
      }));
      fetchEvents(page);
    },
    [fetchEvents]
  );
  return {
    events,
    pagination,
    activities,
    toast,
    searchTerm,
    categoryFilter,
    locationFilter,
    setSearchTerm,
    setCategoryFilter,
    setLocationFilter,
    setPage,
    createEvent,
    updateEvent,
    deleteEvent,
    showToast,
    isLoading,
    fetchEvents,
  };
};
