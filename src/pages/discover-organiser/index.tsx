import React, { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../utils/axiosConfig";
import PublicLayout from "@/components/layout/PublicLayout";
import SearchBar from "@/components/ui/SearchBar";
import OrganiserCard from "@/components/organiser/OrganiserCard";
import Head from "next/head";

interface Organizer {
  id: number;
  uuid: string;
  name: string;
  primaryMail: string;
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
        const response = await axiosInstance.get(
          `${URL}/api/visitor/organization`
        );
        console.log("response::: ", response);
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
  }  return (
    <PublicLayout>
      <Head>
        <title>Discover Organisers | Mycotur</title>
      </Head>
      
      <div className="hidden lg:block min-h-screen bg-gradient-to-br from-[rgba(244,242,242)] to-[rgba(248,250,252)]">
        <div className="container mx-auto px-6 py-8">
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
              </div>
              <div className="lg:w-96">
                <SearchBar
                  locationFilter={locationFilter || "Location"}
                  categoryFilter={categoryFilter || "Event Category"}
                  onFilterChange={handleFilterChange}
                  onSearch={handleSearch}
                  variant="compact"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[rgba(194,91,52)]"></div>
              <p className="mt-6 text-[rgba(100,92,90)] text-lg">Loading organisers...</p>
            </div>
          ) : filteredOrganisers.length === 0 ? (
            <div className="text-center py-20 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-[rgba(226,225,223,0.3)]">
              <p className="text-[rgba(100,92,90)] text-lg">
                No organisers found for the selected filters.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredOrganisers.map((organiser) => (
                <OrganiserCard
                  key={organiser.id}
                  uuid={organiser.uuid}
                  name={organiser.name}
                  about={organiser.about}
                  email={organiser.primaryMail}
                  facebook={organiser.facebook}
                  instagram={organiser.instagram}
                  youtube={organiser.youtube}
                  categories={organiser.categories}
                  totalEvents={organiser.totalEvents}
                  profileImage={organiser.profileImage}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="lg:hidden min-h-screen bg-gradient-to-br from-[rgba(244,242,242)] to-[rgba(248,250,252)]">
        <div className="sticky top-0 z-20  border-b border-[rgba(226,225,223,0.4)] p-4">
          <SearchBar
            locationFilter={locationFilter || "Location"}
            categoryFilter={categoryFilter || "Event Category"}
            onFilterChange={handleFilterChange}
            onSearch={handleSearch}
            variant="mobile"
          />
        </div>

        <div className="p-4">
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[rgba(194,91,52)]"></div>
              <p className="mt-4 text-[rgba(100,92,90)]">Loading organisers...</p>
            </div>
          ) : filteredOrganisers.length === 0 ? (
            <div className="text-center py-16 bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-[rgba(226,225,223,0.3)]">
              <p className="text-[rgba(100,92,90)]">
                No organisers found for the selected filters.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredOrganisers.map((organiser) => (
                  <OrganiserCard
                    key={organiser.id}
                    uuid={organiser.uuid}
                    name={organiser.name}
                    about={organiser.about}
                    email={organiser.primaryMail}
                    facebook={organiser.facebook}
                    instagram={organiser.instagram}
                    youtube={organiser.youtube}
                    categories={organiser.categories}
                    totalEvents={organiser.totalEvents}
                    profileImage={organiser.profileImage}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default DiscoverOrganiserPage;
