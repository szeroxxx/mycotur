import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';

interface EventLocation {
  uuid: string;
  location: string;
}

interface UseEventLocationsReturn {
  locations: EventLocation[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useEventLocations = (): UseEventLocationsReturn => {
  const [locations, setLocations] = useState<EventLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventLocations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const URL = process.env.NEXTAUTH_BACKEND_URL;
      const response = await axiosInstance.get(`${URL}/api/getEventLocations`);

      if (response.data?.data) {
        setLocations(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching event locations:', err);
      setError('Failed to fetch event locations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEventLocations();
  }, []);

  const refetch = async () => {
    await fetchEventLocations();
  };

  return {
    locations,
    isLoading,
    error,
    refetch
  };
};
