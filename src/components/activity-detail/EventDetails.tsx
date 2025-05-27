import React from "react";
import { Calendar, MapPin } from "lucide-react";
import { RiInstagramFill } from "react-icons/ri";
import { IoLogoFacebook } from "react-icons/io5";
import { IoLogoYoutube } from "react-icons/io";

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
                  <div className="flex p-3 items-center gap-3 text-sm bg-white rounded-lg border border-gray-100 w-fit">
                    <Calendar className="text-[rgba(229,114,0)] flex-shrink-0" />
                    <span className="text-[rgba(100,92,90)]">
                      {eventDate.date} at {eventDate.time}
                    </span>
                    <span className="font-medium text-[rgba(229,114,0)]">
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
            {organizer.socialLinks.email && (
              <div className="w-10 h-10 text-[rgba(229,114,0)] border border-[rgba(199,195,193)] rounded flex items-center justify-center">
                <IoLogoYoutube className="w-6 h-6" />
              </div>
            )}
            {organizer.socialLinks.facebook && (
              <div className="w-10 h-10 text-[rgba(229,114,0)] border border-[rgba(199,195,193)] rounded flex items-center justify-center">
                <IoLogoFacebook className="w-6 h-6" />
              </div>
            )}
            {organizer.socialLinks.instagram && (
              <div className="w-10 h-10 text-[rgba(229,114,0)] border border-[rgba(199,195,193)] rounded flex items-center justify-center">
                <RiInstagramFill className="w-6 h-6" />
              </div>
            )}
          </div>
        </div>
      </div>{" "}
      {/* Event Address */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Event Address
        </h3>
        <div className="w-full h-48 bg-gray-100 rounded-lg relative overflow-hidden">
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400">Map will be displayed here</span>
          </div>
          <div className="absolute bottom-4 left-4">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-gray-600" />
              <span className="text-gray-600">Get Directions</span>
            </div>
          </div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <MapPin className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">{location.address}</p>
      </div>
    </div>
  );
};

export default EventDetails;
