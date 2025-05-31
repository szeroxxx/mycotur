import React, { useState } from "react";
import { Calendar, MapPin } from "lucide-react";
import { RiInstagramFill } from "react-icons/ri";
import { IoLogoFacebook } from "react-icons/io5";
import { IoLogoYoutube } from "react-icons/io";
import dynamic from "next/dynamic";

const DirectionsMap = dynamic(() => import("@/components/maps/GoogleDirectionsMap"), {
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

interface EventDate {
  id: string;
  date: string;
  time: string;
}

interface Organizer {
  id: string;
  name: string;
  eventsHosted: number;
  avatar?: string;
  initials: string;
  socialLinks: {
    email?: string;
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };
}

interface Location {
  address: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface EventDetailsProps {
  eventDates: EventDate[];
  seasons: {
    availableMonths: string;
    unavailableMonths?: string;
  };
  description: {
    main: string;
    additional?: string;
  };
  organizer: Organizer;
  location: Location;
}

const EventDetails: React.FC<EventDetailsProps> = ({
  eventDates,
  seasons,
  description,
  organizer,
  location,
}) => {
  const [isDirectionsOpen, setIsDirectionsOpen] = useState(false);

  const handleEventClick = (id: string) => {
    window.open(`/event-detail/${id}`, "_blank");
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[rgba(68,63,63)]">
              View Upcoming Event Dates
            </h3>
            {eventDates.length > 0 ? (
              eventDates.map((eventDate) => (
                <div key={eventDate.id} className="flex">
                  <div
                    onClick={() => handleEventClick(eventDate.id)}
                    className="flex p-3 items-center gap-3 text-sm bg-white rounded-lg border border-gray-100 w-fit"
                  >
                    <Calendar className="text-[rgba(229,114,0)] flex-shrink-0 cursor-pointer" />
                    <span className="text-[rgba(100,92,90)] cursor-pointer">
                      {eventDate.date} at {eventDate.time}
                    </span>
                    <span className="font-medium text-[rgba(229,114,0)] cursor-pointer">
                      Read more details
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[rgba(100,92,90)]">
                No upcoming events scheduled at this time.
              </p>
            )}{" "}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[rgba(68,63,63)]">
              Seasons
            </h3>
            <p className="text-sm text-[rgba(100,92,90)] leading-relaxed">
              {seasons.availableMonths}
            </p>
            {seasons.unavailableMonths && (
              <p className="text-sm text-gray-600 leading-relaxed mt-2">
                {seasons.unavailableMonths}
              </p>
            )}
          </div>
        </div>
      </div>{" "}
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
              <div 
                onClick={() => window.open(organizer.socialLinks.youtube, '_blank')}
                className="cursor-pointer w-10 h-10 text-[rgba(229,114,0)] border border-[rgba(199,195,193)] rounded flex items-center justify-center">
                <IoLogoYoutube className="w-6 h-6" />
              </div>
            )}
            {organizer.socialLinks.facebook && (
              <div
                onClick={() => window.open(organizer.socialLinks.facebook, '_blank')}
                className="cursor-pointer w-10 h-10 text-[rgba(229,114,0)] border border-[rgba(199,195,193)] rounded flex items-center justify-center">
                <IoLogoFacebook className="w-6 h-6" />
              </div>
            )}
            {organizer.socialLinks.instagram && (
              <div
                onClick={() => window.open(organizer.socialLinks.instagram, '_blank')}
                className="cursor-pointer w-10 h-10 text-[rgba(229,114,0)] border border-[rgba(199,195,193)] rounded flex items-center justify-center">
                <RiInstagramFill className="w-6 h-6" />
              </div>
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
          </div>

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
