import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';

interface ActivityLocation {
  uuid: string;
  location: string;
}

interface UseActivityLocationsReturn {
  locations: ActivityLocation[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useActivityLocations = (): UseActivityLocationsReturn => {
  const [locations, setLocations] = useState<ActivityLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivityLocations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const URL = process.env.NEXTAUTH_BACKEND_URL;
      const response = await axiosInstance.get(`${URL}/api/getLocation`);

      if (response.data?.data) {
        setLocations(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching activity locations:', err);
      setError('Failed to fetch activity locations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchActivityLocations();
  }, []);

  const refetch = async () => {
    await fetchActivityLocations();
  };

  return {
    locations,
    isLoading,
    error,
    refetch
  };
};
