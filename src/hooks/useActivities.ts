import { useState, useCallback } from 'react';
import { Activity, Toast, PaginationInfo } from '../types/activity';

const ITEMS_PER_PAGE = 10;

const initialActivities: Activity[] = [
  {
    id: '1',
    title: 'Teruel Experience',
    category: 'Experiences',
    location: '2972 Westheimer Rd. Santa Ana, Illinois 85486',
    startMonth: '2025-05',
    endMonth: '2025-06',
    email: 'teruel@example.com',
    phone: '123-456-7890',
    url: '',
    notes: 'Entry fee: €50 per person',
    description: 'A unique cultural experience in Teruel',
    images: []
  },
  {
    id: '2',
    title: 'fffddd',
    category: 'Experiences',
    location: '2972 Westheimer Rd. Santa Ana, Illinois 85486',
    startMonth: '2025-05',
    endMonth: '2025-06',
    email: 'teruel@example.com',
    phone: '123-456-7890',
    url: '',
    notes: 'Entry fee: €50 per person',
    description: 'A unique cultural experience in Teruel',
    images: []
  },
];

export const useActivities = () => {
  const [activities, setActivities] = useState<Activity[]>(initialActivities);
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: Math.ceil(initialActivities.length / ITEMS_PER_PAGE),
    pageSize: ITEMS_PER_PAGE,
    totalItems: initialActivities.length
  });
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const createActivity = useCallback(async (activity: Omit<Activity, 'id'>) => {
    // API
    const newActivity = {
      ...activity,
      id: Date.now().toString()
    };
    setActivities(prev => [...prev, newActivity]);
    showToast('success', 'Activity created successfully');
    return newActivity;
  }, [showToast]);

  const updateActivity = useCallback(async (activity: Activity) => {
    // API
    setActivities(prev =>
      prev.map(item => item.id === activity.id ? activity : item)
    );
    showToast('success', 'Activity updated successfully');
    return activity;
  }, [showToast]);

  const deleteActivity = useCallback(async (id: string) => {
    // API
    setActivities(prev => prev.filter(activity => activity.id !== id));
    showToast('success', 'Activity deleted successfully');
  }, [showToast]);

  const getFilteredActivities = useCallback(() => {
    if (!searchTerm) return activities;
    
    return activities.filter(activity => 
      activity.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      activity.location.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activities, searchTerm]);

  const getPaginatedActivities = useCallback(() => {
    const filtered = getFilteredActivities();
    const start = (pagination.currentPage - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    
    return filtered.slice(start, end);
  }, [getFilteredActivities, pagination.currentPage, pagination.pageSize]);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  }, []);

  return {
    activities: getPaginatedActivities(),
    pagination,
    toast,
    searchTerm,
    setSearchTerm,
    setPage,
    createActivity,
    updateActivity,
    deleteActivity,
    showToast
  };
};