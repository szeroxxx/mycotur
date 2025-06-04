import React, { useMemo } from "react";
import { X } from "lucide-react";
import { useData } from "@/contexts/DataContext";

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

interface SearchBarProps {
  locationFilter: string;
  categoryFilter: string;
  onFilterChange: (type: "location" | "category", value: string) => void;
  onSearch?: () => void;
  className?: string;
  variant?: "compact" | "full" | "mobile";
  customLocations?: string[]; 
  useCustomLocations?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  locationFilter,
  categoryFilter,
  onFilterChange,
  // onSearch,
  className = "",
  variant = "full",
  customLocations = [],
  useCustomLocations = false,
}) => {
  const { categories, isLoading, error } = useData();

  const categoryOptions = useMemo(
    () => [defaultCategory, ...categories],
    [categories]
  );
  
  const locationOptions = useMemo(() => {
    if (useCustomLocations) {
      const customLocationObjects = customLocations.map((location, index) => ({
        uuid: `custom-${index}`,
        location: location,
      }));
      return [defaultLocation, ...customLocationObjects];
    } else {
      return [defaultLocation];
    }
  }, [useCustomLocations, customLocations]);

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
      {hasActiveFilters && variant === "mobile" && (
        <div className="mb-3 flex items-center justify-between bg-[rgba(194,91,52,0.1)] border border-[rgba(194,91,52,0.2)] rounded-xl p-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-[rgba(194,91,52)] rounded-full"></div>
            <span className="text-sm text-[rgba(194,91,52)] font-medium">
              Filters Applied
            </span>
          </div>
          <button
            onClick={handleClearFilters}
            className="text-[rgba(194,91,52)] hover:bg-[rgba(194,91,52,0.1)] px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium"
          >
            Clear All
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <div
          className={
            variant === "compact" || variant === "mobile"
              ? "flex-1 min-w-0"
              : "w-32"
          }
        >
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
        <div
          className={
            variant === "compact" || variant === "mobile"
              ? "flex-1 min-w-0"
              : "w-36"
          }
        >
          <select
            value={categoryFilter}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="w-full text-[12px] px-4 py-2 text-[rgba(68,63,63)] rounded-lg cursor-pointer hover:border-[rgba(194,91,52)] border-2 border-transparent transition-all duration-200"
          >
            {categoryOptions.map((category) => (
              <option key={category.uuid} value={category.title}>
                {category.title}
              </option>
            ))}
          </select>
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

export default SearchBar;
