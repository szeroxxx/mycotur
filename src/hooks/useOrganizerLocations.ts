import { useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosConfig';

interface UseOrganizerLocationsReturn {
  locations: string[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useOrganizerLocations = (): UseOrganizerLocationsReturn => {
  const [locations, setLocations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrganizerLocations = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const URL = process.env.NEXTAUTH_BACKEND_URL;
      const response = await axiosInstance.get(`${URL}/api/getOrganizerLocations`);

      if (response.data?.data) {
        setLocations(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching organizer locations:', err);
      setError('Failed to fetch organizer locations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizerLocations();
  }, []);

  const refetch = async () => {
    await fetchOrganizerLocations();
  };

  return {
    locations,
    isLoading,
    error,
    refetch
  };
};
