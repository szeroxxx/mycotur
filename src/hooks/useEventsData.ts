import { useState, useEffect } from "react";
import axios from "axios";

import { CalendarEvent } from "../types/calendar-event";

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

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const URL = process.env.NEXTAUTH_BACKEND_URL;
        const response = await axios.get(`${URL}/api/visitor/event`);
        if (response.data && Array.isArray(response.data.data)) {
          setEvents(response.data.data);
          setFilteredEvents(response.data.data);
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