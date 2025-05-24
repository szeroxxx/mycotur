import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import PublicLayout from "@/components/layout/PublicLayout";
import ActivityCard from "@/components/activity-map/ActivityCard";
import { useActivitiesData } from "@/hooks/useActivitiesData";
import SearchBar from "@/components/ui/SearchBar";
import dynamic from "next/dynamic";

const LOCATIONIQ_API_KEY = "pk.bd1aad9ddb52d668b4630b31292a59b6";

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

  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const handleLocationSearch = useCallback(
    async (query: string) => {
      if (!query) {
        setSearchLocation(null);
        return;
      }

      try {
        const response = await fetch(
          `https://us1.locationiq.com/v1/search.php?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(
            query
          )}&format=json&limit=1`
        );

        if (!response.ok) {
          throw new Error("Location search failed");
        }

        const data = await response.json();

        if (data && data[0]) {
          const { lat, lon } = data[0];
          setSearchLocation({ lat: parseFloat(lat), lon: parseFloat(lon) });
        }
      } catch (error) {
        console.error("Error searching location:", error);
      } finally {
        console.log('setIsLoading(false);::: ');
      }
    },
    [setSearchLocation]
  );

  const handleFilterChange = useCallback(
    (type: "location" | "category", value: string) => {
      const newLocationFilter =
        type === "location" ? (value === "Location" ? "" : value) : locationFilter;
      const newCategoryFilter =
        type === "category" ? (value === "Event Category" ? "" : value) : categoryFilter;

      setLocationFilter(newLocationFilter);
      setCategoryFilter(newCategoryFilter);

      filterActivities(searchTerm, newLocationFilter, newCategoryFilter);
    },
    [searchTerm, locationFilter, categoryFilter, filterActivities]
  );

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        handleLocationSearch(searchTerm);
      }
      filterActivities(searchTerm, locationFilter, categoryFilter);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, locationFilter, categoryFilter, filterActivities, handleLocationSearch]);

  return (
    <PublicLayout>
      <Head>
        <title>Activity Map | Mycotur</title>
      </Head>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden scrollbar-hide">
        <div className="w-1/3 flex flex-col bg-[rgba(255,255,255)] border-r border-[rgba(226,225,223)]">
          <div className="p-4 flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
            <div className="space-y-4">
              <SearchBar
                locationFilter={locationFilter || "Location"}
                categoryFilter={categoryFilter || "Event Category"}
                onFilterChange={handleFilterChange}
                onSearch={() => filterActivities(searchTerm, locationFilter, categoryFilter)}
                onChange={setSearchTerm}
                value={searchTerm}
              />

              <div className="space-y-4 mt-4">
                {loading ? (
                  <div className="text-center py-8">Loading activities...</div>
                ) : filteredActivities.length === 0 ? (
                  <div className="text-center py-8 bg-white rounded-xl shadow-sm">
                    <p className="text-gray-500">
                      No activities found for the selected filters.
                    </p>
                  </div>
                ) : (
                  filteredActivities.map((activity) => (
                    <ActivityCard
                      key={activity.id}
                      id={activity.id}
                      title={activity.title}
                      user={activity.user}
                      location={activity.location}
                      category={activity.category}
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
      </div>
    </PublicLayout>
  );
};

export default ActivityMapPage;
