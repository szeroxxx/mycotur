import React from "react";
import { Youtube, Facebook, Instagram } from "lucide-react";

interface OrganiserDetailHeaderProps {
  organiser: {
    id: string | string[] | undefined;
    name: string;
    totalEvents: number;
    categories: string[];
    description: string;
    colorDots?: string[];
  };
}

const DetailHeader: React.FC<OrganiserDetailHeaderProps> = ({ organiser }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <div className="flex items-start gap-6">
        <div className="w-32 h-32 bg-gray-200 rounded-lg shrink-0"></div>

        <div className="flex-grow">
          <h1 className="text-2xl font-semibold text-gray-800 mb-4">
            {organiser.name}
          </h1>

          <div className="flex items-center text-sm text-gray-600 mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
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
            <span>Total Events: {organiser.totalEvents}</span>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {organiser.categories.map((category, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
              >
                {category}
              </span>
            ))}
          </div>

          <div className="flex space-x-4">
            <a
              href="#"
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Youtube className="h-6 w-6" />
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Facebook className="h-6 w-6" />
            </a>
            <a
              href="#"
              className="text-gray-600 hover:text-gray-800 transition-colors"
            >
              <Instagram className="h-6 w-6" />
            </a>
          </div>
        </div>

        <button className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">
          Contact Organiser
        </button>
      </div>
    </div>
  );
};

export default DetailHeader;
