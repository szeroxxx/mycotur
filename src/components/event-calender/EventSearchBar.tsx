import React, { useMemo } from "react";
import { X } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { useEventLocations } from "@/hooks/useEventLocations";

interface Category {
  uuid: string;
  title: string;
  description: string;
}

interface Location {
  uuid: string;
  location: string;
}

const defaultLocation: Location = {
  uuid: "",
  location: "Location",
};

const defaultCategory: Category = {
  uuid: "",
  title: "Event Category",
  description: "",
};

interface EventSearchBarProps {
  locationFilter: string;
  categoryFilter: string;
  onFilterChange: (type: "location" | "category", value: string) => void;
  onSearch?: () => void;
  className?: string;
  variant?: "compact" | "full";
}

const EventSearchBar: React.FC<EventSearchBarProps> = ({
  locationFilter,
  categoryFilter,
  onFilterChange,
  // onSearch,
  className = "",
  variant = "full",
}) => {
  const { categories, isLoading: categoriesLoading, error: categoriesError } = useData();
  
  const { locations, isLoading: locationsLoading, error: locationsError } = useEventLocations();

  const categoryOptions = useMemo(
    () => [defaultCategory, ...categories],
    [categories]
  );
  
  const locationOptions = useMemo(
    () => [defaultLocation, ...locations],
    [locations]
  );

  const hasActiveFilters = useMemo(() => {
    return locationFilter !== "Location" || categoryFilter !== "Event Category";
  }, [locationFilter, categoryFilter]);

  const handleFilterChange = (
    type: "location" | "category",
    value: string
  ): void => {
    onFilterChange(type, value);
  };

  const handleClearFilters = (): void => {
    onFilterChange("location", "Location");
    onFilterChange("category", "Event Category");
  };

  const isLoading = categoriesLoading || locationsLoading;
  const error = categoriesError || locationsError;

  if (isLoading) {
    return (
      <div className="bg-white rounded-[20px] shadow-md p-4 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-[20px] shadow-md p-4 flex items-center justify-center">
        <p className="text-red-500">Error loading data</p>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-[20px] shadow-md p-4 ${className}`}>
      <div className="flex gap-2">
        <div className={variant === "compact" ? "flex-1 min-w-0" : "w-32"}>
          <select
            value={locationFilter}
            onChange={(e) => handleFilterChange("location", e.target.value)}
            className="w-full text-[12px] px-4 py-2 text-[rgba(68,63,63)] rounded-lg cursor-pointer hover:border-[rgba(194,91,52)] border-2 border-transparent transition-all duration-200"
          >
            {locationOptions.map((location) => (
              <option key={location.uuid} value={location.location}>
                {location.location}
              </option>
            ))}
          </select>
        </div>
        <div className={variant === "compact" ? "flex-1 min-w-0" : "w-36"}>
          <select
            value={categoryFilter}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="w-full text-[12px] px-4 py-2 text-[rgba(68,63,63)] rounded-lg cursor-pointer hover:border-[rgba(194,91,52)] border-2 border-transparent transition-all duration-200"
          >
            {categoryOptions.map((category) => (
              <option key={category.uuid} value={category.title}>
                {category.title}
              </option>
            ))}          </select>
        </div>
        
        <button
          onClick={handleClearFilters}
          disabled={!hasActiveFilters}
          className={`px-4 py-2 rounded-lg flex-shrink-0 transition-all duration-200 ${
            hasActiveFilters
              ? "text-[rgba(194,91,52)] hover:bg-gray-100 cursor-pointer"
              : "text-gray-400 cursor-not-allowed opacity-50"
          }`}
          title={hasActiveFilters ? "Clear filters" : "No filters to clear"}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default EventSearchBar;