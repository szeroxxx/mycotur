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
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [isDateFilterActive, setIsDateFilterActive] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    location: "Ubicación",
    category: "Tipo de evento",
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

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const URL = process.env.NEXTAUTH_BACKEND_URL;
        const response = await axiosInstance.get(`${URL}/api/visitor/event`);
        if (response.data && Array.isArray(response.data.data)) {
          const mappedEvents = mapEventsData(response.data.data);
          setEvents(mappedEvents);
          setFilteredEvents(mappedEvents);
        }
        setLoading(false);
      } catch (err) {
        console.log("err::: ", err);
        setError("Failed to load events");
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);  const filterEvents = (date?: Date, location?: string, category?: string) => {
    const newLocation = location || filters.location;
    const newCategory = category || filters.category;


    setFilters({
      location: newLocation,
      category: newCategory,
    });

    let filtered = [...events];    if (date) {
      setSelectedDate(date);
      setIsDateFilterActive(true);
      filtered = filtered.filter((event) => {
        const eventDate = new Date(event.date);
        return (
          eventDate.getFullYear() === date.getFullYear() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getDate() === date.getDate()
        );
      });
    } else {
      setIsDateFilterActive(false);
    }

    // if (newLocation !== "Ubicación") {
    //   let locationFiltered = [...events];
    //   if (date) {
    //     locationFiltered = locationFiltered.filter((event) => {
    //       const eventDate = new Date(event.date);
    //       return (
    //         eventDate.getFullYear() === date.getFullYear() &&
    //         eventDate.getMonth() === date.getMonth() &&
    //         eventDate.getDate() === date.getDate()
    //       );
    //     });
    //   }
      
    //   filtered = locationFiltered.filter((event) =>
    //     event.location.toLowerCase().includes(newLocation.toLowerCase())
    //   );
    // }

    if (newCategory !== "Tipo de evento") {
      let categoryFiltered = [...events];
        if (date) {
        categoryFiltered = categoryFiltered.filter((event) => {
          const eventDate = new Date(event.date);
          return (
            eventDate.getFullYear() === date.getFullYear() &&
            eventDate.getMonth() === date.getMonth() &&
            eventDate.getDate() === date.getDate()
          );
        });
      }
      
      // if (newLocation !== "Ubicación") {
      //   categoryFiltered = categoryFiltered.filter((event) =>
      //     event.location.toLowerCase().includes(newLocation.toLowerCase())
      //   );
      // }
      
      
      filtered = categoryFiltered.filter((event) => {
        const categoryMatch = event.category?.toLowerCase() === newCategory.toLowerCase();
        const categoriesMatch = event.categories?.some(
          (cat) => cat?.toLowerCase() === newCategory.toLowerCase()
        );
        return categoryMatch || categoriesMatch;
      });
    }

    setFilteredEvents(filtered);
    return filtered;
  };
  const clearAllFilters = () => {
    setIsDateFilterActive(false);
    setFilters({
      location: "Ubicación",
      category: "Tipo de evento",
    });
    setFilteredEvents(events);
    return events;
  };

  const dateHasEvent = (date: Date) => {
    return events.some((event) => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  };  return {
    events,
    filteredEvents,
    selectedDate,
    isDateFilterActive,
    loading,
    error,
    filterEvents,
    clearAllFilters,
    dateHasEvent,
  };
};
