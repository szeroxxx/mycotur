import React, { useState } from "react";

import EventCalendar from "../../components/event-calender/EventCalendar";
import EventCard from "../../components/event-calender/EventCard";
import { useEventsData } from "../../hooks/useEventsData";
import { CalendarEvent } from "../../types/calendar-event";

import PublicLayout from "@/components/layout/PublicLayout";
import Head from "next/head";
import SearchBar from "@/components/ui/SearchBar";


const Index = () => {
  const {
    filteredEvents,
    loading,
    selectedDate,
    filterEvents,
    dateHasEvent,
    events,
  } = useEventsData();

  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState("Location");
  const [categoryFilter, setCategoryFilter] = useState("Event Category");  const calendarEvents = events.map((event: CalendarEvent) => ({
    id: event.uuid,
    date: new Date(event.date),
    title: event.title,
    hasEvent: true,
  }));

  const handleDateSelect = (date: Date) => {
    filterEvents(date, locationFilter, categoryFilter);
  };

  const handleSearch = () => {
    filterEvents(selectedDate, locationFilter, categoryFilter);
  };

  const handleFilterChange = (type: "location" | "category", value: string) => {
    if (type === "location") {
      setLocationFilter(value);
    } else {
      setCategoryFilter(value);
    }
  };

  return (
    <PublicLayout>
      <Head>
        <title>Event Via Calender | Mycotur</title>
      </Head>
      <div className="container mx-auto p-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/3 space-y-4 ">
            <SearchBar
              locationFilter={locationFilter}
              categoryFilter={categoryFilter}
              onFilterChange={handleFilterChange}
              onSearch={handleSearch}
            />

            <div className="space-y-4 mt-4 overflow-y-auto overflow-x-hidden scrollbar-hide max-h-[calc(100vh-16rem)]">
              {loading ? (
                <div className="text-center py-8">Loading events...</div>
              ) : filteredEvents.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-xl shadow-sm">
                  <p className="text-gray-500">
                    No events found for the selected filters.
                  </p>
                </div>              ) : (                filteredEvents.map((event) => (
                  <EventCard
                    key={event.uuid}
                    id={event.uuid}
                    media={event.media}
                    title={event.title}
                    date={event.date}
                    time={event.time}
                    location={event.location}
                    owner={event.owner}
                    isSelected={event.uuid === selectedEvent}
                    onClick={() => setSelectedEvent(event.uuid)}
                  />
                ))
              )}
            </div>
          </div>
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <EventCalendar
                events={calendarEvents}
                onDateSelect={handleDateSelect}
                selectedDate={selectedDate}
                checkDateHasEvent={dateHasEvent}
              />
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Index;
