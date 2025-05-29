import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import PublicLayout from "@/components/layout/PublicLayout";
import SearchBar from "@/components/ui/SearchBar";
import OrganiserCard from "@/components/organiser/OrganiserCard";

interface Organizer {
  id: number;
  uuid: string;
  name: string;
  email: string;
  role: string;
  status: string;
  about: string | null;
  address: string | null;
  facebook: string | null;
  instagram: string | null;
  youtube: string | null;
  categories: {
    id: number;
    title: string;
    description: string;
  }[];
  profileImage: string | null;
  totalEvents: number;
}

const DiscoverOrganiserPage = () => {
  const [organisers, setOrganisers] = useState<Organizer[]>([]);
  const [filteredOrganisers, setFilteredOrganisers] = useState<Organizer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationFilter, setLocationFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  useEffect(() => {
    const fetchOrganisers = async () => {
      try {
        const URL = process.env.NEXTAUTH_BACKEND_URL;
        const response = await axios.get(`${URL}/api/visitor/organization`);
        setOrganisers(response.data);
        setFilteredOrganisers(response.data);
      } catch (error) {
        console.error("Error fetching organisers:", error);
        setError(
          error instanceof Error
            ? error.message
            : "An error occurred while fetching organisers"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrganisers();
  }, []);
  const filterOrganisers = useCallback(() => {
    let filtered = [...organisers];

    if (locationFilter && locationFilter !== "Location") {
      filtered = filtered.filter(
        (organiser) =>
          organiser.address &&
          organiser.address.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (categoryFilter && categoryFilter !== "Event Category") {
      filtered = filtered.filter((organiser) =>
        organiser.categories.some(
          (category) =>
            category.title.toLowerCase() === categoryFilter.toLowerCase()
        )
      );
    }

    setFilteredOrganisers(filtered);
  }, [organisers, locationFilter, categoryFilter]);
  useEffect(() => {
    filterOrganisers();
  }, [filterOrganisers]);

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

  const handleSearch = useCallback(() => {
    filterOrganisers();
  }, [filterOrganisers]);

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-gray-600">Loading organisers...</div>
        </div>
      </PublicLayout>
    );
  }

  if (error) {
    return (
      <PublicLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-lg text-red-600">Error: {error}</div>
        </div>
      </PublicLayout>
    );
  }
  return (
    <PublicLayout>
      <div className="flex justify-end mb-3 mt-2 bg-[rgba(244,242,242)]">
        {" "}
        <SearchBar
          locationFilter={locationFilter || "Location"}
          categoryFilter={categoryFilter || "Event Category"}
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">        {filteredOrganisers.map((organiser) => (
          <OrganiserCard
            key={organiser.id}
            // id={organiser.id}
            uuid={organiser.uuid}
            name={organiser.name}
            about={organiser.about}
            // address={organiser.address}
            email={organiser.email}
            facebook={organiser.facebook}
            instagram={organiser.instagram}
            youtube={organiser.youtube}
            categories={organiser.categories}
            totalEvents={organiser.totalEvents}
            profileImage={organiser.profileImage}
          />
        ))}
      </div>

      {filteredOrganisers.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-600">No organisers found.</p>
        </div>
      )}
    </PublicLayout>
  );
};

export default DiscoverOrganiserPage;
