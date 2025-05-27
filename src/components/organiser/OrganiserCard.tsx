import React from "react";
import { Youtube, Facebook, Instagram } from "lucide-react";
import Link from "next/link";

interface OrganiserCardProps {
  uuid: string;
  name: string;
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
  totalEvents: number;
}

const OrganiserCard: React.FC<OrganiserCardProps> = ({
  uuid,
  name,
  about,
  address,
  facebook,
  instagram,
  youtube,
  categories,
  totalEvents,
}) => {
  return (
    <div className="block">
      <div className="bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200">
        <div className="p-4 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 bg-gray-200 rounded-md shrink-0"></div>

            <div className="space-y-2">
              <h3 className="font-medium text-gray-800 line-clamp-2">{name}</h3>
              <div className="flex items-center text-xs text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span>Total Event ({totalEvents})</span>
              </div>

              <div className="flex space-x-2 mt-2">
                {youtube && (
                  <a href={youtube} target="_blank" rel="noopener noreferrer">
                    <Youtube className="h-5 w-5 text-orange-500" />
                  </a>
                )}
                {facebook && (
                  <a href={facebook} target="_blank" rel="noopener noreferrer">
                    <Facebook className="h-5 w-5 text-orange-500" />
                  </a>
                )}
                {instagram && (
                  <a href={instagram} target="_blank" rel="noopener noreferrer">
                    <Instagram className="h-5 w-5 text-orange-500" />
                  </a>
                )}
              </div>

              {address && (
                <div className="text-xs text-gray-500">
                  <span>📍 {address}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            {categories.map((category) => (
              <div
                key={category.id}
                className="text-xs text-gray-600 line-clamp-1"
              >
                {category.title}
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">
            {about || "No description available."}
          </p>

          <Link href={`/discover-organiser/${uuid}`} className="block">
            <button className="w-full py-3 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700 transition-colors">
              Get Contact Information
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrganiserCard;
