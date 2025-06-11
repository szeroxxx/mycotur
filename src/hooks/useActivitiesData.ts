import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../utils/axiosConfig";
import { getMediaUrl } from "../utils/mediaHelpers";

interface RawActivityData {
  uuid: string;
  title: string;
  category: string;
  categories?: string[];
  owner?: string;
  location: string;
  description: string;
  image?: string;
  lat: string;
  lon: string;
}

export interface ActivityData {
  id: string;
  uuid: string;
  title: string;
  category: string;
  categories: string[];
  user: string;
  location: string;
  description: string;
  image: string;
  lat: number;
  lon: number;
}

export const useActivitiesData = () => {
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityData[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    location: "",
    category: "",
    searchTerm: "",
  });
  const [selectedActivity, setSelectedActivity] = useState<ActivityData | null>(
    null
  );
  const [searchLocation, setSearchLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);
  const mapActivityData = (data: RawActivityData[]): ActivityData[] => {
    return data
      .map((item) => {
        const lat = parseFloat(item.lat);
        const lon = parseFloat(item.lon);
        if (isNaN(lat) || isNaN(lon)) {
          console.warn(
            `Skipping activity "${item.title}" due to invalid coordinates: lat=${item.lat}, lon=${item.lon}`
          );
          return null;
        }
        return {
          id: item.uuid,
          uuid: item.uuid,
          title: item.title,
          category: item.category,
          categories: item.categories || (item.category ? [item.category] : []),
          user: item.owner || "Unknown",
          location: item.location,
          description: item.description,
          image: item.image
            ? getMediaUrl(item.image)
            : "/default-activity-image.png",
          lat,
          lon,
        };
      })
      .filter((item): item is ActivityData => item !== null);
  };

  const applyFilters = useCallback(
    (items: ActivityData[], currentFilters = filters) => {
      let result = [...items];

      if (currentFilters.searchTerm) {
        const searchLower = currentFilters.searchTerm.toLowerCase();
        result = result.filter(
          (activity) =>
            activity.title.toLowerCase().includes(searchLower) ||
            activity.location.toLowerCase().includes(searchLower)
        );
      }
      if (currentFilters.location && currentFilters.location !== "Ubicación") {
        result = result.filter((activity) =>
          activity.location
            .toLowerCase()
            .includes(currentFilters.location.toLowerCase())
        );
      }
      if (
        currentFilters.category &&
        currentFilters.category !== "Categoría de la actividad"
      ) {
        result = result.filter((activity) => {
          const categoryMatch =
            activity.category?.toLowerCase() ===
            currentFilters.category.toLowerCase();
          const categoriesMatch = activity.categories?.some(
            (cat) =>
              cat?.toLowerCase() === currentFilters.category.toLowerCase()
          );
          return categoryMatch || categoriesMatch;
        });
      }

      return result;
    },
    []
  );

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const URL = process.env.NEXTAUTH_BACKEND_URL;
        const response = await axiosInstance.get(`${URL}/api/visitor/activity`);
        if (response.data && Array.isArray(response.data.data)) {
          const mappedActivities = mapActivityData(response.data.data);
          setActivities(mappedActivities);
          setFilteredActivities(mappedActivities);
        }
      } catch (err) {
        console.error("Error fetching activities:", err);
        setError("Failed to load activities");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  useEffect(() => {
    const filtered =
      activities.length > 0 ? applyFilters(activities, filters) : [];
    setFilteredActivities(filtered);
  }, [activities, filters, applyFilters]);

  const filterActivities = useCallback(
    (searchTerm?: string, location?: string, category?: string) => {
      setFilters((prev) => ({
        searchTerm: searchTerm ?? prev.searchTerm,
        location: location ?? prev.location,
        category: category ?? prev.category,
      }));
    },
    []
  );

  return {
    activities,
    filteredActivities,
    loading,
    error,
    filterActivities,
    selectedActivity,
    setSelectedActivity,
    searchLocation,
    setSearchLocation,
  };
};
