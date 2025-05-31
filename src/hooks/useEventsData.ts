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
  description: string;
  lat: string;
  lon: string;
}

export const useEventsData = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    location: "Location",
    category: "Event Category"
  });

  // Separate function for mapping events
  const mapEventsData = (data: RawEventData[]): CalendarEvent[] => {
    return data.map((item) => ({
      uuid: item.uuid,
      title: item.title,
      image: item.media
        ? getMediaUrl(item.media)
        : "/default-event-image.jpg",
      date: item.date,
      time: item.time,
      location: item.location,      owner: item.owner || "Unknown",
      category: item.category,
      description: item.description,
      lat: item.lat,
      lon: item.lon,
    }));
  };



  useEffect(() => {
    const fetchEvents = async () => {      try {
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
        console.log('err::: ', err);
        setError("Failed to load events");
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);
  const filterEvents = (date?: Date, location?: string, category?: string) => {
    // const newDate = date || selectedDate;
    const newLocation = location || filters.location;
    const newCategory = category || filters.category;

    setFilters({
      location: newLocation,
      category: newCategory
    });

    let filtered = [...events];

    if (date) {
      setSelectedDate(date);
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.date);
        return (
          eventDate.getFullYear() === date.getFullYear() &&
          eventDate.getMonth() === date.getMonth() &&
          eventDate.getDate() === date.getDate()
        );
      });
    }

    if (newLocation !== "Location") {
      filtered = filtered.filter(event => 
        event.location.toLowerCase().includes(newLocation.toLowerCase())
      );
    }

    if (newCategory !== "Event Category") {
      filtered = filtered.filter(event => 
        event.category === newCategory
      );
    }

    setFilteredEvents(filtered);
    return filtered;
  };

  const dateHasEvent = (date: Date) => {
    return events.some(event => {
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
    loading,
    error,
    filterEvents,
    dateHasEvent
  };
};