import React, { useState, useEffect } from "react";
import { Calendar, MapPin } from "lucide-react";
import { RiInstagramFill } from "react-icons/ri";
import { IoLogoFacebook } from "react-icons/io5";
import { IoLogoYoutube } from "react-icons/io";
import dynamic from "next/dynamic";
import { googleMapsLoader } from "@/utils/googleMapsLoader";

const DirectionsMap = dynamic(() => import("../maps/GoogleDirectionsMap"), {
  ssr: false,
  loading: () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 m-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgba(229,114,0)] mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading map...</p>
        </div>
      </div>
    </div>
  ),
});

interface EventDetailsProps {
  date: string;
  time: string;
  description: {
    main: string;
    additional?: string;
  };
  organizer: {
    id: string;
    name: string;
    avatar?: string;
    eventsHosted: number;
    initials: string;
    socialLinks: {
      email?: string;
      facebook?: string;
      instagram?: string;
      youtube?: string;
    };
  };
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
}

const EventDetails: React.FC<EventDetailsProps> = ({
  date,
  time,
  description,
  organizer,
  location,
}) => {
  const [isDirectionsOpen, setIsDirectionsOpen] = useState(false);
  useEffect(() => {
    if (location.coordinates) {
      googleMapsLoader.load().catch((error) => {
        console.warn('Failed to preload Google Maps:', error);
      });
    }
  }, [location.coordinates]);

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "long" });
    const year = date.getFullYear();

    const ordinalSuffix = (d: number): string => {
      if (d > 3 && d < 21) return "th";
      switch (d % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    return `${day}${ordinalSuffix(day)} ${month}, ${year}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex p-3 items-center gap-3 text-sm ">
            <span className="bg-[rgba(255,255,255)] p-2 rounded-lg">
              <Calendar className="text-[rgba(229,114,0)] flex-shrink-0 " />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[rgba(68,63,63)]">
                  Date and Time
                </span>
              </div>
              <span className="text-[rgba(100,92,90)]">
                {formatDate(date)} {time}
              </span>
            </div>
          </div>

          <div className="flex p-3 items-center gap-3 text-sm ">
            <span className="bg-[rgba(255,255,255)] p-2 rounded-lg">
              <MapPin className="text-[rgba(229,114,0)] flex-shrink-0 " />
            </span>
            <div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-[rgba(68,63,63)]">
                    Location
                  </span>
                </div>
                <span className="text-[rgba(100,92,90)]">
                  {location.address}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-semibold text-[rgba(68,63,63)] mb-4">
          Description
        </h3>
        <p className="text-sm text-[rgba(100,92,90)] leading-relaxed">
          {description.main}
        </p>
        {description.additional && (
          <p className="text-sm text-[rgba(100,92,90)] leading-relaxed mt-3">
            {description.additional}
          </p>
        )}
      </div>
      <div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
            {organizer.avatar ? (
              <img
                src={organizer.avatar}
                alt={organizer.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <span className="text-white font-semibold text-sm">
                {organizer.initials}
              </span>
            )}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[rgba(68,63,63)]">
              Meet the organizer {organizer.name}
            </h3>
            <p className="text-xs text-[rgba(100,92,90)]">
              {organizer.eventsHosted} Events Hosted
            </p>
          </div>
          <div className="flex gap-2 ">
            {organizer.socialLinks.youtube && (
              <a
                href={organizer.socialLinks.youtube}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="w-10 h-10 text-[rgba(229,114,0)] border border-[rgba(199,195,193)] rounded flex items-center justify-center">
                  <IoLogoYoutube className="w-6 h-6" />
                </div>
              </a>
            )}
            {organizer.socialLinks.facebook && (
              <a
                href={organizer.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="w-10 h-10 text-[rgba(229,114,0)] border border-[rgba(199,195,193)] rounded flex items-center justify-center">
                  <IoLogoFacebook className="w-6 h-6" />
                </div>
              </a>
            )}
            {organizer.socialLinks.instagram && (
              <a
                href={organizer.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="w-10 h-10 text-[rgba(229,114,0)] border border-[rgba(199,195,193)] rounded flex items-center justify-center">
                  <RiInstagramFill className="w-6 h-6" />
                </div>
              </a>
            )}
          </div>
        </div>
      </div>{" "}
      <div>
        <h3 className="text-lg font-semibold text-[rgba(68,63,63)] mb-4">
          Event Address
        </h3>
        <div
          className={`w-full h-48 bg-gray-100 rounded-lg relative overflow-hidden transition-colors ${
            location.coordinates
              ? "cursor-pointer hover:bg-gray-50"
              : "cursor-not-allowed"
          }`}
          onClick={() => location.coordinates && setIsDirectionsOpen(true)}
        >
          <div className="w-full h-full bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-[rgba(229,114,0)] rounded-full flex items-center justify-center mx-auto mb-2">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <span className="text-[rgba(68,63,63)] font-medium">
                {location.coordinates
                  ? "Click to view on map"
                  : "Location not available"}
              </span>
            </div>
          </div>{" "}
          <div
            className={`absolute bottom-4 left-4 bg-white rounded-lg px-3 py-2 shadow-sm border border-gray-200 ${
              !location.coordinates ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-[rgba(229,114,0)]" />
              <span className="text-[rgba(68,63,63)] font-medium">
                {location.coordinates
                  ? "Get Directions"
                  : "Directions unavailable"}
              </span>
            </div>
          </div>
        </div>
        <p className="text-sm text-[rgba(100,92,90)] mt-2">
          {location.address}
        </p>
        {isDirectionsOpen && location.coordinates && (
          <DirectionsMap
            eventLocation={{
              address: location.address,
              coordinates: {
                lat: location.coordinates.lat,
                lng: location.coordinates.lng,
              },
            }}
            isOpen={isDirectionsOpen}
            onClose={() => setIsDirectionsOpen(false)}
          />
        )}
      </div>
    </div>
  );
};

export default EventDetails;
