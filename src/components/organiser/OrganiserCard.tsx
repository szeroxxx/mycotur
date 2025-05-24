import React from "react";
import { Youtube, Facebook, Instagram } from "lucide-react";
import Link from "next/link";

interface OrganiserCardProps {
  id: number;
  name: string;
  totalEvents: number;
  categories: string[];
  description: string;
  colorDots?: string[];
}

const OrganiserCard: React.FC<OrganiserCardProps> = ({
  id,
  name,
  totalEvents,
  categories,
  description,
}) => {
  return (
    <Link href={`/discover-organiser/${id}`} className="block">
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
                <Youtube className="h-5 w-5 text-orange-500" />
                <Facebook className="h-5 w-5 text-orange-500" />
                <Instagram className="h-5 w-5 text-orange-500" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            {categories.map((category, index) => (
              <div key={index} className="text-xs text-gray-600 line-clamp-1">
                {category}
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-600 leading-relaxed">{description}</p>

          <button className="w-full py-3 bg-gray-800 text-white text-sm rounded-md hover:bg-gray-700 transition-colors">
            Get Contact Information
          </button>
        </div>
      </div>
    </Link>
  );
};

export default OrganiserCard;
