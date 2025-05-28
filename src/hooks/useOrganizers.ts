import axios from 'axios';
import { useState, useEffect } from 'react';

export interface Organizer {
  id: number;
  uuid: string;
  name: string;
  email: string;
  role: string;
  status: string;
  about: string | null;
  address: string | null;
  facebook: string | null;
  instagram: string | null;
  youtube: string | null;
  categories: {
    id: number;
    title: string;
    description: string;
  }[];
  profileImage: string | null;
  totalEvents: number;
}

export const useOrganizers = () => {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganizers = async () => {
      try {
        const URL = process.env.NEXTAUTH_BACKEND_URL;
        const response = await axios.get(`${URL}/api/visitor/organization`);
        setOrganizers(response.data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch organizers');
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizers();
  }, []);

  return { organizers, loading, error };
};
