import React from "react";
import { Calendar } from "lucide-react";
import { RiInstagramFill } from "react-icons/ri";
import { IoLogoFacebook } from "react-icons/io5";
import { IoLogoYoutube } from "react-icons/io";
import { createEventUrl } from "../../utils/urlHelpers";
import StaticMapView from "../maps/StaticMapView";

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
  activityTitle: string;
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
  activityTitle,
  eventDates,
  seasons,
  description,
  organizer,
  location,
}) => {
  const openInGoogleMaps = () => {
    if (!location.coordinates) return;
    const destination = `${location.coordinates.lat},${location.coordinates.lng}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${destination}`;
    window.open(url, '_blank');
  };

  const handleEventClick = (id: string) => {
    const eventTitle = `${activityTitle} Event`;
    const eventUrl = createEventUrl(eventTitle, id);
    window.open(eventUrl, "_blank");
  };

  return (
    <div className="space-y-6">      <div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-[rgba(68,63,63)]">
              Próximos eventos organizados
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
                      Ver evento
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[rgba(100,92,90)]">
                No se encontraron eventos programados en este momento.
              </p>
            )}{" "}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-[rgba(68,63,63)]">
              Temporadas
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
          Descripción
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
              Conoce al organizador  {organizer.name}
            </h3>
            <p className="text-xs text-[rgba(100,92,90)]">
              {organizer.eventsHosted} Eventos Organizados
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
      </div>{" "}      <div>
        <h3 className="text-lg font-semibold text-[rgba(68,63,63)] mb-4">
          Lugar del evento
        </h3>
        <StaticMapView
          location={location}
          onGetDirections={openInGoogleMaps}
        />
        <p className="text-sm text-[rgba(100,92,90)] mt-2">
          {location.address}
        </p>
      </div>
    </div>
  );
};

export default EventDetails;
