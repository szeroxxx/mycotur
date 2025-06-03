import React, { useState } from "react";

import EventCalendar from "../../components/event-calender/EventCalendar";
import EventCard from "../../components/event-calender/EventCard";
import { useEventsData } from "../../hooks/useEventsData";
import { CalendarEvent } from "../../types/calendar-event";

import PublicLayout from "@/components/layout/PublicLayout";
import Head from "next/head";
import EventSearchBar from "@/components/event-calender/EventSearchBar";

const Index = () => {  const {
    filteredEvents,
    loading,
    selectedDate,
    isDateFilterActive,
    filterEvents,
    dateHasEvent,
    events,
  } = useEventsData();

  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState("Location");
  const [categoryFilter, setCategoryFilter] = useState("Event Category");
  const calendarEvents = events.map((event: CalendarEvent) => ({
    id: event.uuid,
    date: new Date(event.date),
    title: event.title,
    hasEvent: true,
  }));
  const handleDateSelect = (date: Date) => {
    const isSameDate = selectedDate && 
      selectedDate.getFullYear() === date.getFullYear() &&
      selectedDate.getMonth() === date.getMonth() &&
      selectedDate.getDate() === date.getDate();
    
    if (isSameDate) {
      filterEvents(undefined, locationFilter, categoryFilter);
    } else {
      filterEvents(date, locationFilter, categoryFilter);
    }
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
      
      <div className="hidden lg:flex h-[calc(100vh-4rem)] overflow-hidden scrollbar-hide">
        <div className="w-1/3 flex flex-col border-r border-[rgba(226,225,223,0.6)]  bg-gradient-to-br from-[rgba(244,242,242)] to-[rgba(248,250,252)]">
          <div className="p-6 flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide touch-scroll">
            <div className="space-y-6">
              <EventSearchBar
                locationFilter={locationFilter}
                categoryFilter={categoryFilter}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                variant="compact"
              />
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[rgba(194,91,52)]"></div>
                    <p className="mt-4 text-[rgba(100,92,90)]">Loading events...</p>
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="text-center py-12 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-[rgba(226,225,223,0.3)]">
                    <p className="text-[rgba(100,92,90)] text-lg">
                      No events found for the selected filters.
                    </p>
                  </div>
                ) : (
                  filteredEvents.map((event) => (
                    <EventCard
                      key={event.uuid}
                      id={event.uuid}
                      title={event.title}
                      date={event.date}
                      time={event.time}
                      location={event.location}
                      category={event.category}
                      owner={event.owner}
                      image={event.image}
                      isSelected={event.uuid === selectedEvent}
                      onClick={() => setSelectedEvent(event.uuid)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="w-2/3 sticky top-0 h-full">
          <div className="h-full bg-white rounded-none shadow-sm flex flex-col">
            <EventCalendar
              events={calendarEvents}
              onDateSelect={handleDateSelect}
              selectedDate={isDateFilterActive ? selectedDate : undefined}
              checkDateHasEvent={dateHasEvent}
            />
          </div>
        </div>
      </div>

      <div className="lg:hidden h-[calc(100vh-4rem)] flex flex-col mb-5">
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-white to-gray-50 border-b border-[rgba(226,225,223,0.4)] sticky top-0 z-20">
          <h1 className="text-lg font-semibold text-[rgba(68,63,63)]">
            Event Calendar
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide touch-scroll bg-gradient-to-b from-white to-gray-50">
          <div className="h-[45vh] bg-white shadow-lg mx-4 mt-4 rounded-2xl overflow-hidden">
            <EventCalendar
              events={calendarEvents}
              onDateSelect={handleDateSelect}
              selectedDate={isDateFilterActive ? selectedDate : undefined}
              checkDateHasEvent={dateHasEvent}
            />
          </div>

          <div className="p-4 pb-2">
            <EventSearchBar
              locationFilter={locationFilter}
              categoryFilter={categoryFilter}
              onFilterChange={handleFilterChange}
              onSearch={handleSearch}
              variant="compact"
            />
          </div>

          <div className="px-4 pb-6 space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[rgba(194,91,52)]"></div>
                <p className="mt-4 text-[rgba(100,92,90)]">Loading events...</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-[rgba(226,225,223,0.3)]">
                <p className="text-[rgba(100,92,90)] text-base">
                  No events found for the selected filters.
                </p>
              </div>
            ) : (
              filteredEvents.map((event) => (
                <EventCard
                  key={event.uuid}
                  id={event.uuid}
                  title={event.title}
                  date={event.date}
                  time={event.time}
                  location={event.location}
                  category={event.category}
                  owner={event.owner}
                  image={event.image}
                  isSelected={event.uuid === selectedEvent}
                  onClick={() => setSelectedEvent(event.uuid)}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Index;
