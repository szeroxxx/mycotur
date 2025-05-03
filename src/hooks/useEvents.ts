import { useState, useCallback } from 'react';
import { Event, Toast, PaginationInfo } from '../types/event';

const ITEMS_PER_PAGE = 10;

const initialEvents: Event[] = [
  {
    id: '1',
    activityName: 'Teruel Experience',
    event: 'Teruel Experience',
    eventDate: '2025-04-20',
    eventTime: '12:00',
    category: 'Experiences',
    location: '2972 Westheimer Rd. Santa Ana, Illinois 85486',
    description: 'A unique cultural experience in Teruel',
    email: 'teruel@example.com',
    phone: '123-456-7890',
    fees: '€50 per person',
    images: []
  },
  {
    id: '2',
    activityName: 'Teruel Experience 2',
    event: 'Cultural Event',
    eventDate: '2025-05-15',
    eventTime: '14:00',
    category: 'Cultural',
    location: '2972 Westheimer Rd. Santa Ana, Illinois 85486',
    description: 'Cultural event in Teruel',
    email: 'culture@example.com',
    phone: '123-456-7891',
    fees: '€30 per person',
    images: []
  }
];

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: Math.ceil(initialEvents.length / ITEMS_PER_PAGE),
    pageSize: ITEMS_PER_PAGE,
    totalItems: initialEvents.length
  });
  const [toast, setToast] = useState<Toast | null>(null);

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const createEvent = useCallback(async (event: Omit<Event, 'id'>) => {
    //API
    const newEvent = {
      ...event,
      id: Date.now().toString()
    };
    setEvents(prev => [...prev, newEvent]);
    showToast('success', 'Event created successfully');
    return newEvent;
  }, [showToast]);

  const updateEvent = useCallback(async (event: Event) => {
    //API
    setEvents(prev =>
      prev.map(item => item.id === event.id ? event : item)
    );
    showToast('success', 'Event updated successfully');
    return event;
  }, [showToast]);

  const deleteEvent = useCallback(async (id: string) => {
    //API
    setEvents(prev => prev.filter(event => event.id !== id));
    showToast('success', 'Event deleted successfully');
  }, [showToast]);

  const getFilteredEvents = useCallback(() => {
    return events.filter(event => {
      const matchesSearch = !searchTerm || 
        event.event.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.activityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = !categoryFilter || event.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [events, searchTerm, categoryFilter]);

  const getPaginatedEvents = useCallback(() => {
    const filtered = getFilteredEvents();
    const start = (pagination.currentPage - 1) * pagination.pageSize;
    const end = start + pagination.pageSize;
    
    return filtered.slice(start, end);
  }, [getFilteredEvents, pagination.currentPage, pagination.pageSize]);

  const setPage = useCallback((page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
  }, []);

  // Mock activities data - will be replaced with API call
  const activities = [
    { id: '1', title: 'Teruel Experience' },
    { id: '2', title: 'Teruel Experience 2' }
  ];

  return {
    events: getPaginatedEvents(),
    pagination: {
      ...pagination,
      totalPages: Math.ceil(getFilteredEvents().length / ITEMS_PER_PAGE),
      totalItems: getFilteredEvents().length
    },
    activities,
    toast,
    searchTerm,
    categoryFilter,
    setSearchTerm,
    setCategoryFilter,
    setPage,
    createEvent,
    updateEvent,
    deleteEvent,
    showToast
  };
};