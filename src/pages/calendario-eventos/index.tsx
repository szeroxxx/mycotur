import React, { useState } from "react";

import EventCalendar from "../../components/event-calender/EventCalendar";
import EventCard from "../../components/event-calender/EventCard";
import { useEventsData } from "../../hooks/useEventsData";
import { CalendarEvent } from "../../types/calendar-event";

import PublicLayout from "@/components/layout/PublicLayout";
import Head from "next/head";
import EventSearchBar from "@/components/event-calender/EventSearchBar";

const Index = () => {
  const {
    filteredEvents,
    loading,
    calendarLoading,
    selectedDate,
    isDateFilterActive,
    filterEvents,
    clearAllFilters,
    dateHasEvent,
    events,
    loadAllEventsForCalendar,
    error,
  } = useEventsData();
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  // const [locationFilter, setLocationFilter] = useState("Ubicación");
  const [categoryFilter, setCategoryFilter] = useState("Categoría del evento");
  const calendarEvents = events.map((event: CalendarEvent) => ({
    id: event.uuid,
    date: new Date(event.date),
    title: event.title,
    hasEvent: true,
  }));
  const handleDateSelect = async (date: Date) => {
    const isSameDate =
      selectedDate &&
      selectedDate.getFullYear() === date.getFullYear() &&
      selectedDate.getMonth() === date.getMonth() &&
      selectedDate.getDate() === date.getDate();

    if (isSameDate && isDateFilterActive) {
      await filterEvents(undefined, "Ubicación", categoryFilter);
    } else {
      await filterEvents(date, "Ubicación", categoryFilter);
    }
  };

  const handleSearch = async () => {
    await filterEvents(selectedDate, "Ubicación", categoryFilter);
  };

  const handleClearAllFilters = async () => {
    setCategoryFilter("Categoría del evento");
    await clearAllFilters();
  };
  const handleFilterChange = async (
    type: "location" | "category",
    value: string
  ) => {
    // if (type === "location") {
    //   setLocationFilter(value);

    //   if (value === "Ubicación" && categoryFilter === "Categoría del evento") {
    //     clearAllFilters();
    //   } else {
    //     filterEvents(
    //       isDateFilterActive ? selectedDate : undefined,
    //       value,
    //       categoryFilter
    //     );
    //   }
    // } else {
    setCategoryFilter(value);

    if (value === "Categoría del evento" && !isDateFilterActive) {
      await clearAllFilters();
    } else {
      await filterEvents(
        isDateFilterActive ? selectedDate : undefined,
        "Ubicación",
        value
      );
    }
    // }
  };
  return (
    <PublicLayout>
      <Head>
        <title>Calendario de Eventos Micológicos | Ávila Mycotour</title>
        <meta
          name="description"
          content="Consulta las fechas de los principales eventos micológicos en Ávila. Actividades guiadas, talleres y salidas al bosque para disfrutar en diferentes épocas del año."
        />
      </Head>
      <div className="hidden lg:flex h-[calc(100vh-5rem)] overflow-hidden scrollbar-hide">
        <div className="w-1/3 flex flex-col border-r border-[rgba(226,225,223,0.6)]  bg-gradient-to-br from-[rgba(244,242,242)] to-[rgba(248,250,252)]">
          <div className="p-6 flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide touch-scroll">
            {" "}
            <div className="space-y-6">
              <EventSearchBar
                // locationFilter="Ubicación"
                categoryFilter={categoryFilter}
                onFilterChange={handleFilterChange}
                onSearch={handleSearch}
                onClearAllFilters={handleClearAllFilters}
                isDateFilterActive={isDateFilterActive}
                variant="compact"
              />
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[rgba(194,91,52)]"></div>
                    <p className="mt-4 text-[rgba(100,92,90)]">
                      Cargando eventos...
                    </p>
                  </div>
                ) : error ? (
                  <div className="text-center py-12 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl shadow-lg border border-red-200">
                    <p className="text-red-600 text-lg mb-4">
                      Error al cargar los eventos
                    </p>
                    <button
                      onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Reintentar
                    </button>
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="text-center py-12 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-[rgba(226,225,223,0.3)]">
                    <p className="text-[rgba(100,92,90)] text-lg">
                      No se encontraron eventos para los filtros seleccionados.
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
                      categories={event.categories}
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
          <div className="h-full bg-white rounded-none shadow-sm flex flex-col relative">
            {calendarLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[rgba(194,91,52)]"></div>
                  <p className="mt-4 text-[rgba(100,92,90)]">
                    Cargando calendario...
                  </p>
                </div>
              </div>
            )}
            <EventCalendar
              events={calendarEvents}
              onDateSelect={handleDateSelect}
              selectedDate={isDateFilterActive ? selectedDate : undefined}
              checkDateHasEvent={dateHasEvent}
              onCalendarMount={loadAllEventsForCalendar}
            />
          </div>
        </div>
      </div>{" "}
      <div className="lg:hidden h-[calc(100vh-5rem)] flex flex-col">
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-white to-gray-50 border-b border-[rgba(226,225,223,0.4)] sticky top-0 z-20">
          <h1 className="text-lg font-semibold text-[rgba(68,63,63)]">
            Calendario de Eventos
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide touch-scroll bg-gradient-to-b from-white to-gray-50">
          <div className="h-[45vh] bg-white shadow-lg mx-4 mt-4 rounded-2xl overflow-hidden relative">
            {calendarLoading && (
              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[rgba(194,91,52)]"></div>
                  <p className="mt-2 text-[rgba(100,92,90)] text-sm">
                    Cargando calendario...
                  </p>
                </div>
              </div>
            )}
            <EventCalendar
              events={calendarEvents}
              onDateSelect={handleDateSelect}
              selectedDate={isDateFilterActive ? selectedDate : undefined}
              checkDateHasEvent={dateHasEvent}
              onCalendarMount={loadAllEventsForCalendar}
            />
          </div>{" "}
          <div className="p-4 pb-2">
            <EventSearchBar
              // locationFilter="Ubicación"
              categoryFilter={categoryFilter}
              onFilterChange={handleFilterChange}
              onSearch={handleSearch}
              onClearAllFilters={handleClearAllFilters}
              isDateFilterActive={isDateFilterActive}
              variant="compact"
            />
          </div>
          <div className="px-4 pb-20 space-y-4">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[rgba(194,91,52)]"></div>
                <p className="mt-4 text-[rgba(100,92,90)]">
                  Cargando eventos...
                </p>
              </div>
            ) : error ? (
              <div className="text-center py-12 bg-gradient-to-br from-red-50 to-red-100 rounded-2xl shadow-lg border border-red-200">
                <p className="text-red-600 text-base mb-4">
                  Error al cargar los eventos
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-[rgba(226,225,223,0.3)]">
                <p className="text-[rgba(100,92,90)] text-base">
                  No se encontraron eventos para los filtros seleccionados.
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
                  categories={event.categories}
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
