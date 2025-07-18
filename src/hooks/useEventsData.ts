import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosConfig";
import { getMediaUrl } from "../utils/mediaHelpers";

import { CalendarEvent } from "../types/calendar-event";

interface RawEventData {
  uuid: string;
  title: string;
  media?: string;
  date: string;
  time: string;
  location: string;
  owner?: string;
  category: string;
  categories?: string[];
  description: string;
  lat: string;
  lon: string;
}

export const useEventsData = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]); // Store all events including past ones
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDateFilterActive, setIsDateFilterActive] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [allEventsLoaded, setAllEventsLoaded] = useState(false);
  const [filters, setFilters] = useState({
    location: "Ubicación",
    category: "Categoría del evento",
  });

  const mapEventsData = (data: RawEventData[]): CalendarEvent[] => {
    return data.map((item) => ({
      uuid: item.uuid,
      title: item.title,
      image: item.media
        ? getMediaUrl(item.media)
        : "/default-activity-image.png",
      date: item.date,
      time: item.time,
      location: item.location,
      owner: item.owner || "Unknown",
      category: item.category,
      categories: item.categories || (item.category ? [item.category] : []),
      description: item.description,
      lat: item.lat,
      lon: item.lon,
    }));
  };

  const fetchEvents = async (
    filterDate?: string,
    includePastEvents: boolean = false
  ) => {
    try {
      if (includePastEvents) {
        setCalendarLoading(true);
      } else {
        setLoading(true);
      }

      const URL = process.env.NEXTAUTH_BACKEND_URL;
      let apiUrl = `${URL}/api/visitor/event`;

      const params = new URLSearchParams();

      if (filterDate) {
        params.append("date", filterDate);
      }

      if (includePastEvents) {
        params.append("includePastEvents", "true");
      }

      if (params.toString()) {
        apiUrl += `?${params.toString()}`;
      }

      const response = await axiosInstance.get(apiUrl);
      if (response.data && Array.isArray(response.data.data)) {
        const mappedEvents = mapEventsData(response.data.data);

        if (filterDate) {
          setFilteredEvents(mappedEvents);
          setIsDateFilterActive(true);
        } else {
          setEvents(mappedEvents);
          setFilteredEvents(mappedEvents);

          if (includePastEvents) {
            setAllEvents(mappedEvents);
            setAllEventsLoaded(true);
          }
        }
      } else {
        if (filterDate) {
          setFilteredEvents([]);
          setIsDateFilterActive(true);
        } else {
          setEvents([]);
          setFilteredEvents([]);
          if (includePastEvents) {
            setAllEvents([]);
            setAllEventsLoaded(true);
          }
        }
      }

      if (includePastEvents) {
        setCalendarLoading(false);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.log("err::: ", err);
      setError("Failed to load events");
      if (includePastEvents) {
        setCalendarLoading(false);
        setAllEventsLoaded(true);
      } else {
        setLoading(false);
      }

      if (filterDate) {
        setFilteredEvents([]);
        setIsDateFilterActive(true);
      } else {
        setEvents([]);
        setFilteredEvents([]);
        if (includePastEvents) {
          setAllEvents([]);
        }
      }
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);
  const filterEvents = async (
    date?: Date,
    location?: string,
    category?: string
  ) => {
    const newLocation = location || filters.location;
    const newCategory = category || filters.category;

    setFilters({
      location: newLocation,
      category: newCategory,
    });

    if (date) {
      setSelectedDate(date);
      setIsDateFilterActive(true);

      const formattedDate = date.toISOString().split("T")[0];

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(date);
      selectedDate.setHours(0, 0, 0, 0);
      const isPastDate = selectedDate < today;

      if (isPastDate && !allEventsLoaded) {
        await fetchEvents(undefined, true);
      }
      const eventsToSearch = isPastDate ? allEvents : events;
      const localEvents = eventsToSearch.filter((event) => {
        const eventDate = new Date(event.date);
        return (
          eventDate.getFullYear() === date.getFullYear() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getDate() === date.getDate()
        );
      });

      if (localEvents.length > 0) {
        let filtered = localEvents;

        if (newCategory !== "Categoría del evento") {
          filtered = filtered.filter((event) => {
            const categoryMatch =
              event.category?.toLowerCase() === newCategory.toLowerCase();
            const categoriesMatch = event.categories?.some(
              (cat) => cat?.toLowerCase() === newCategory.toLowerCase()
            );
            return categoryMatch || categoriesMatch;
          });
        }

        setFilteredEvents(filtered);
        return filtered;
      } else {
        await fetchEvents(formattedDate);
        return;
      }
    } else {
      setIsDateFilterActive(false);

      let filtered = [...events];

      if (newCategory !== "Categoría del evento") {
        filtered = filtered.filter((event) => {
          const categoryMatch =
            event.category?.toLowerCase() === newCategory.toLowerCase();
          const categoriesMatch = event.categories?.some(
            (cat) => cat?.toLowerCase() === newCategory.toLowerCase()
          );
          return categoryMatch || categoriesMatch;
        });
      }

      setFilteredEvents(filtered);
      return filtered;
    }
  };
  const clearAllFilters = async () => {
    setIsDateFilterActive(false);
    setFilters({
      location: "Ubicación",
      category: "Categoría del evento",
    });
    setError(null); // Clear any previous errors
    await fetchEvents();
  };

  const loadAllEventsForCalendar = async () => {
    if (!allEventsLoaded && !calendarLoading) {
      await fetchEvents(undefined, true);
    }
  };

  const dateHasEvent = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    const eventsToCheck = checkDate < today ? allEvents : events;

    return eventsToCheck.some((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  };
  return {
    events,
    filteredEvents,
    selectedDate,
    isDateFilterActive,
    loading,
    calendarLoading,
    error,
    filterEvents,
    clearAllFilters,
    dateHasEvent,
    loadAllEventsForCalendar,
  };
};
