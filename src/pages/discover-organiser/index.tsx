import React, { useState, useEffect } from "react";
import axios from "axios";
import PublicLayout from "@/components/layout/PublicLayout";
import FilterBar from "@/components/organiser/FilterBar";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrganisers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3500/server/api/visitor/organization"
        );
        setOrganisers(response.data);
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
      <FilterBar />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organisers.map((organiser) => (
          <OrganiserCard
            key={organiser.id}
            uuid={organiser.uuid}
            name={organiser.name}
            about={organiser.about}
            address={organiser.address}
            facebook={organiser.facebook}
            instagram={organiser.instagram}
            youtube={organiser.youtube}
            categories={organiser.categories}
            totalEvents={organiser.totalEvents}
          />
        ))}
      </div>

      {organisers.length === 0 && (
        <div className="text-center py-10">
          <p className="text-gray-600">No organisers found.</p>
        </div>
      )}
    </PublicLayout>
  );
};

export default DiscoverOrganiserPage;
