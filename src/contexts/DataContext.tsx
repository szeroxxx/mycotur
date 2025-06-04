import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axiosInstance from '../utils/axiosConfig';

interface Category {
  uuid: string;
  title: string;
  description: string;
}

interface DataContextType {
  categories: Category[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const URL = process.env.NEXTAUTH_BACKEND_URL;
      const categoriesResponse = await axiosInstance.get(`${URL}/api/category`);

      if (categoriesResponse.data?.data) {
        setCategories(categoriesResponse.data.data);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetch = async () => {
    await fetchData();
  };

  const value: DataContextType = {
    categories,
    isLoading,
    error,
    refetch
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
