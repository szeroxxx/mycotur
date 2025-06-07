import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { Map, List, X } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import ActivityCard from "@/components/activity-map/ActivityCard";
import { useActivitiesData } from "@/hooks/useActivitiesData";
import SearchBar from "@/components/ui/SearchBar";
// import { useActivityLocations } from "@/hooks/useActivityLocations";
import dynamic from "next/dynamic";

const DynamicMapView = dynamic(
  () => import("@/components/activity-map/MapView"),
  { ssr: false }
);

const ActivityMapPage = () => {
  const {
    filteredActivities,
    loading,
    filterActivities,
    selectedActivity,
    setSelectedActivity,
    setSearchLocation,
  } = useActivitiesData();

  // const {
  //   locations: activityLocations,
  //   // isLoading: locationsLoading
  // } = useActivityLocations();  // const [locationFilter, setLocationFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showMobileMap, setShowMobileMap] = useState(false);
  
  const handleFilterChange = useCallback(
    (type: "location" | "category", value: string) => {
      // if (type === "location") {
      //   setLocationFilter(value === "Ubicación" ? "" : value);
      // } else {
        setCategoryFilter(value === "Tipo de evento" ? "" : value);
      // }
    },
    []
  );

  useEffect(() => {
    filterActivities("", "", categoryFilter);
  }, [categoryFilter, filterActivities]);

  useEffect(() => {
    setSearchLocation(null);
  }, [setSearchLocation]);

  // useEffect(() => {
  //   if (locationFilter || categoryFilter) {
  //     filterActivities("", locationFilter, categoryFilter);
  //   }
  // }, [locationFilter, categoryFilter]);

  return (
    <PublicLayout>
      <Head>
        <title>Activity Map | Mycotur</title>
      </Head>
      <div className="hidden lg:flex h-[calc(100vh-5rem)] overflow-hidden scrollbar-hide">
        <div className="w-1/3 flex flex-col border-r border-[rgba(226,225,223,0.6)]">
          <div className="p-6 flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide touch-scroll">
            <div className="space-y-6">
              {" "}              <SearchBar
                locationFilter="Ubicación"
                categoryFilter={categoryFilter || "Tipo de evento"}
                onFilterChange={handleFilterChange}
                onSearch={() =>
                  filterActivities("", "", categoryFilter)
                }
                variant="compact"
                // customLocations={activityLocations.map((loc) => loc.location)}
                // useCustomLocations={true}
              />
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[rgba(194,91,52)]"></div>
                    <p className="mt-4 text-[rgba(100,92,90)]">
                      Cargando actividades...{" "}
                    </p>
                  </div>
                ) : filteredActivities.length === 0 ? (
                  <div className="text-center py-12 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-[rgba(226,225,223,0.3)]">
                    <p className="text-[rgba(100,92,90)] text-lg">
                      No se encontraron actividades para los filtros
                      seleccionados.{" "}
                    </p>
                  </div>
                ) : (
                  filteredActivities.map((activity) => (
                    <ActivityCard
                      key={activity.id}
                      id={activity.id}
                      uuid={activity.uuid}
                      title={activity.title}
                      user={activity.user}
                      location={activity.location}
                      category={activity.categories}
                      image={activity.image}
                      isSelected={selectedActivity?.id === activity.id}
                      onClick={() => setSelectedActivity(activity)}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="w-2/3 sticky top-0 h-full">
          {!loading && (
            <DynamicMapView
              locations={filteredActivities}
              selectedLocation={selectedActivity}
              onMarkerClick={(location) => {
                const activity = filteredActivities.find(
                  (a) => a.id === location.id
                );
                if (activity) setSelectedActivity(activity);
              }}
            />
          )}
        </div>
      </div>{" "}
      <div className="lg:hidden h-[calc(100vh-5rem)] flex flex-col">
        <div className="flex justify-between items-center p-4 bg-gradient-to-r from-white to-gray-50 border-b border-[rgba(226,225,223,0.4)] sticky top-0 z-20">
          <h1 className="text-lg font-semibold text-[rgba(68,63,63)]">
            Activity Map
          </h1>
          <button
            onClick={() => setShowMobileMap(!showMobileMap)}
            className="flex items-center gap-2 px-4 py-2 bg-[rgba(194,91,52)] text-white rounded-xl shadow-md hover:bg-[rgba(174,81,42)] transition-all duration-200"
          >
            {showMobileMap ? (
              <>
                <List size={16} />
                <span className="text-sm">Mostrar Lista</span>
              </>
            ) : (
              <>
                <Map size={16} />
                <span className="text-sm">Mostrar Mapa</span>
              </>
            )}
          </button>
        </div>

        {showMobileMap ? (
          <div className="flex-1 relative bg-gray-100 overflow-hidden">
            <button
              onClick={() => setShowMobileMap(false)}
              className="absolute top-4 right-4 z-10 p-3 bg-white rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 border border-[rgba(226,225,223,0.3)]"
            >
              <X size={20} className="text-[rgba(68,63,63)]" />
            </button>
            {!loading && (
              <DynamicMapView
                locations={filteredActivities}
                selectedLocation={selectedActivity}
                onMarkerClick={(location) => {
                  const activity = filteredActivities.find(
                    (a) => a.id === location.id
                  );
                  if (activity) setSelectedActivity(activity);
                }}
              />
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto scrollbar-hide touch-scroll bg-gradient-to-b from-white to-gray-50">
            <div className="h-[25vh] relative bg-gray-100 overflow-hidden shadow-lg mx-4 mt-4 rounded-2xl">
              {!loading && (
                <DynamicMapView
                  locations={filteredActivities}
                  selectedLocation={selectedActivity}
                  onMarkerClick={(location) => {
                    const activity = filteredActivities.find(
                      (a) => a.id === location.id
                    );
                    if (activity) setSelectedActivity(activity);
                  }}
                />
              )}
            </div>{" "}
            <div className="p-4 pb-2">              <SearchBar
                locationFilter="Ubicación"
                categoryFilter={categoryFilter || "Tipo de evento"}
                onFilterChange={handleFilterChange}
                variant="compact"
                // customLocations={activityLocations.map((loc) => loc.location)}
                // useCustomLocations={true}
              />
            </div>
            <div className="px-4 pb-20 space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[rgba(194,91,52)]"></div>
                  <p className="mt-4 text-[rgba(100,92,90)]">
                    Cargando actividades...
                  </p>
                </div>
              ) : filteredActivities.length === 0 ? (
                <div className="text-center py-12 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-[rgba(226,225,223,0.3)]">
                  <p className="text-[rgba(100,92,90)] text-base">
                    No se encontraron actividades para los filtros seleccionados.
                  </p>
                </div>
              ) : (
                filteredActivities.map((activity) => (
                  <ActivityCard
                    key={activity.id}
                    id={activity.id}
                    uuid={activity.uuid}
                    title={activity.title}
                    user={activity.user}
                    location={activity.location}
                    category={activity.categories}
                    image={activity.image}
                    isSelected={selectedActivity?.id === activity.id}
                    onClick={() => setSelectedActivity(activity)}
                  />
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </PublicLayout>
  );
};

export default ActivityMapPage;
