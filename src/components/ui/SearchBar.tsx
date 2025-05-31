import React, { useMemo } from "react";
import { Search, X } from "lucide-react";
import { motion } from "framer-motion";
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
  onSearch: () => void;
  className?: string;
  variant?: "compact" | "full"; // compact for sidebars, full for header
}

const SearchBar: React.FC<SearchBarProps> = ({
  locationFilter,
  categoryFilter,
  onFilterChange,
  onSearch,
  className = "",
  variant = "full",
}) => {
  const { categories, locations, isLoading, error } = useData();

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
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`bg-white rounded-[20px] shadow-md p-4 ${className}`}
    >
      <motion.div
        className="flex gap-2"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <motion.div
          className={variant === "compact" ? "flex-1 min-w-0" : "w-32"}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.select
            value={locationFilter}
            onChange={(e) => handleFilterChange("location", e.target.value)}
            className="w-full text-[12px] px-4 py-2 text-[rgba(68,63,63)] rounded-lg cursor-pointer hover:border-[rgba(194,91,52)] border-2 border-transparent transition-all duration-200"
          >
            {locationOptions.map((location) => (
              <option key={location.uuid} value={location.location}>
                {location.location}
              </option>
            ))}
          </motion.select>
        </motion.div>
        <motion.div
          className={variant === "compact" ? "flex-1 min-w-0" : "w-36"}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.select
            value={categoryFilter}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="w-full text-[12px] px-4 py-2 text-[rgba(68,63,63)] rounded-lg cursor-pointer hover:border-[rgba(194,91,52)] border-2 border-transparent transition-all duration-200"
          >
            {categoryOptions.map((category) => (
              <option key={category.uuid} value={category.title}>
                {category.title}
              </option>
            ))}
          </motion.select>
        </motion.div>
        
        {hasActiveFilters && (
          <motion.button
            onClick={handleClearFilters}
            className=" text-[rgba(194,91,52)] px-4 py-2 rounded-lg flex-shrink-0"
            whileHover={{
              scale: 1.05,
              backgroundColor: "#4b5563",
            }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.5, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.5, x: 20 }}
            transition={{
              duration: 0.3,
              type: "spring",
              stiffness: 500,
            }}
            title="Clear filters"
          >
            <motion.div
              whileHover={{ rotate: [0, 90, 180, 270, 360] }}
              transition={{ duration: 0.5 }}
            >
              <X className="w-5 h-5" />
            </motion.div>
          </motion.button>
        )}

        <motion.button
          onClick={onSearch}
          className="bg-[rgba(194,91,52)] text-white px-4 py-2 rounded-lg flex-shrink-0"
          whileHover={{
            scale: 1.05,
            backgroundColor: "#cc6600",
          }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.3,
            type: "spring",
            stiffness: 500,
          }}
        >
          <motion.div
            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Search className="w-5 h-5" />
          </motion.div>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default SearchBar;