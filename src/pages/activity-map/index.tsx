import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import PublicLayout from "@/components/layout/PublicLayout";
import ActivityCard from "@/components/activity-map/ActivityCard";
import { useActivitiesData } from "@/hooks/useActivitiesData";
import SearchBar from "@/components/ui/SearchBar";
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
  const [locationFilter, setLocationFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  const handleFilterChange = useCallback(
    (type: "location" | "category", value: string) => {
      if (type === "location") {
        setLocationFilter(value === "Location" ? "" : value);
      } else {
        setCategoryFilter(value === "Event Category" ? "" : value);
      }
    },
    []
  );
  useEffect(() => {
    filterActivities("", locationFilter, categoryFilter);
  }, [locationFilter, categoryFilter, filterActivities]);

  useEffect(() => {
    setSearchLocation(null);
  }, [setSearchLocation]);
  useEffect(() => {
    if (locationFilter || categoryFilter) {
      filterActivities("", locationFilter, categoryFilter);
    }
  }, [locationFilter, categoryFilter]);

  return (
    <PublicLayout>
      <Head>
        <title>Activity Map | Mycotur</title>
      </Head>
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden scrollbar-hide">
        <div className="w-1/3 flex flex-col bg-[rgba(255,255,255)] border-r border-[rgba(226,225,223)]">
          <div className="p-4 flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide">
            <div className="space-y-4">
              {" "}
              <SearchBar
                locationFilter={locationFilter || "Location"}
                categoryFilter={categoryFilter || "Event Category"}
                onFilterChange={handleFilterChange}
                onSearch={() =>
                  filterActivities("", locationFilter, categoryFilter)
                }
                variant="compact"
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
