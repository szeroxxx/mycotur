import React, { useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { motion } from "framer-motion";
import { useProfile } from "@/hooks/useProfile";

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
}

const SearchBar: React.FC<SearchBarProps> = ({
  locationFilter,
  categoryFilter,
  onFilterChange,
  onSearch,
  className = "",
}) => {
  const { fetchCategories, fetchLocations } = useProfile();
  const [categories, setCategories] = useState<Category[]>([defaultCategory]);
  const [locations, setLocations] = useState<Location[]>([defaultLocation]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, locationsData] = await Promise.all([
          fetchCategories(),
          fetchLocations(),
        ]);

        setCategories([defaultCategory, ...categoriesData]);
        setLocations([defaultLocation, ...locationsData]);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [fetchCategories, fetchLocations]);

  const handleFilterChange = (
    type: "location" | "category",
    value: string
  ): void => {
    onFilterChange(type, value);
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-[20px] shadow-md p-4 flex items-center justify-center">
        <p>Loading...</p>
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
      {" "}      <motion.div
        className="flex gap-2"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <motion.div
          className="w-32"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.select
            value={locationFilter}
            onChange={(e) => handleFilterChange("location", e.target.value)}
            className="w-full text-[12px] px-4 py-2 text-[rgba(68,63,63)] rounded-lg cursor-pointer hover:border-[rgba(194,91,52)] border-2 border-transparent transition-all duration-200"
          >
            {locations.map((location) => (
              <option key={location.uuid} value={location.location}>
                {location.location}
              </option>
            ))}
          </motion.select>
        </motion.div>

        <motion.div
          className="w-36"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.select
            value={categoryFilter}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="w-full text-[12px] px-4 py-2 text-[rgba(68,63,63)] rounded-lg cursor-pointer hover:border-[rgba(194,91,52)] border-2 border-transparent transition-all duration-200"
          >
            {categories.map((category) => (
              <option key={category.uuid} value={category.title}>
                {category.title}
              </option>
            ))}
          </motion.select>
        </motion.div>

        <motion.button
          onClick={onSearch}
          className="bg-[rgba(194,91,52)] text-white px-4 py-2 rounded-lg"
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
            <IoSearchOutline className="w-5 h-5" />
          </motion.div>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default SearchBar;
