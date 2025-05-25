import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { getMediaUrl } from "../utils/mediaHelpers";

// Interface for the raw activity data from the API
interface RawActivityData {
  id: number;
  title: string;
  category: string;
  owner?: string;
  location: string;
  description: string;
  image?: string;
  lat: string;
  lon: string;
}

export interface ActivityData {
  id: number;
  title: string;
  category: string;
  user: string;
  location: string;
  description: string;
  image: string;
  lat: number;
  lon: number;
}

export const useActivitiesData = () => {
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    location: "",
    category: "",
    searchTerm: ""
  });
  const [selectedActivity, setSelectedActivity] = useState<ActivityData | null>(null);
  const [searchLocation, setSearchLocation] = useState<{ lat: number; lon: number } | null>(null);

  // Separate function for mapping activities
  const mapActivityData = (data: RawActivityData[]): ActivityData[] => {
    return data.map(item => ({
      id: item.id,
      title: item.title,
      category: item.category,
      user: item.owner || 'Unknown',
      location: item.location,
      description: item.description,
      image: item.image ? getMediaUrl(item.image) : '/default-activity-image.jpg',
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon)
    }));
  };

  // Memoized filter function
  const applyFilters = useCallback((items: ActivityData[], currentFilters = filters) => {
    let result = [...items];

    if (currentFilters.searchTerm) {
      const searchLower = currentFilters.searchTerm.toLowerCase();
      result = result.filter(
        activity =>
          activity.title.toLowerCase().includes(searchLower) ||
          activity.location.toLowerCase().includes(searchLower)
      );
    }

    if (currentFilters.location && currentFilters.location !== "Location") {
      result = result.filter(activity =>
        activity.location.toLowerCase().includes(currentFilters.location.toLowerCase())
      );
    }

    if (currentFilters.category && currentFilters.category !== "Event Category") {
      result = result.filter(activity =>
        activity.category.toLowerCase() === currentFilters.category.toLowerCase()
      );
    }

    return result;
  }, []);

  // Fetch activities on mount
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const URL = process.env.NEXTAUTH_BACKEND_URL;
        const response = await axios.get(`${URL}/api/visitor/activity`);

        if (response.data && Array.isArray(response.data.data)) {
          const mappedActivities = mapActivityData(response.data.data);
          setActivities(mappedActivities);
          setFilteredActivities(mappedActivities); // Initially show all activities
        }
      } catch (err) {
        console.error('Error fetching activities:', err);
        setError("Failed to load activities");
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Apply filters whenever filters or activities change
  useEffect(() => {
    if (activities.length > 0) {
      const filtered = applyFilters(activities, filters);
      setFilteredActivities(filtered);
    }
  }, [activities, filters, applyFilters]);

  const filterActivities = useCallback((
    searchTerm?: string,
    location?: string,
    category?: string,
  ) => {
    const newFilters = {
      searchTerm: searchTerm ?? filters.searchTerm,
      location: location ?? filters.location,
      category: category ?? filters.category
    };

    setFilters(newFilters);
  }, [filters]);

  return {
    activities,
    filteredActivities,
    loading,
    error,
    filterActivities,
    selectedActivity,
    setSelectedActivity,
    searchLocation,
    setSearchLocation
  };
};
