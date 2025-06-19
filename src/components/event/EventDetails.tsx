import React, { useEffect } from "react";
import { Calendar, MapPin } from "lucide-react";
import { RiInstagramFill } from "react-icons/ri";
import { IoLogoFacebook } from "react-icons/io5";
import { IoLogoYoutube } from "react-icons/io";
import { googleMapsLoader } from "@/utils/googleMapsLoader";
import StaticMapView from "../maps/StaticMapView";
import { convertDateToSpanish } from "../../utils/dateHelpers";

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
  const openInGoogleMaps = () => {
    if (!location.coordinates) return;

    const destination = `${location.coordinates.lat},${location.coordinates.lng}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${destination}`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    if (location.coordinates) {
      googleMapsLoader.load().catch((error) => {
        console.warn("Failed to preload Google Maps:", error);
      });
    }
  }, [location.coordinates]);

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
                  Fecha y Hora
                </span>
              </div>
              <span className="text-[rgba(100,92,90)]">
                {convertDateToSpanish(date)} {time}
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
                    Ubicación
                  </span>
                </div>
                <span className="text-[rgba(100,92,90)]">
                  {location.address}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>      <div>
        <h3 className="text-lg font-semibold text-[rgba(68,63,63)] mb-4">
          Descripción
        </h3>
        <p className="text-sm text-[rgba(100,92,90)] leading-relaxed whitespace-pre-wrap">
          {description.main}
        </p>
        {description.additional && (
          <p className="text-sm text-[rgba(100,92,90)] leading-relaxed mt-3 whitespace-pre-wrap">
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
              Organizado por {organizer.name}
            </h3>
            <p className="text-xs text-[rgba(100,92,90)]">
              {organizer.eventsHosted} Eventos organizados
            </p>
          </div>{" "}
          <div className="flex gap-2 ">
            {organizer.socialLinks.youtube && (
              <div
                onClick={() =>
                  window.open(organizer.socialLinks.youtube, "_blank")
                }
                className="cursor-pointer w-10 h-10 text-[rgba(229,114,0)] border border-[rgba(199,195,193)] rounded flex items-center justify-center"
              >
                <IoLogoYoutube className="w-6 h-6" />
              </div>
            )}
            {organizer.socialLinks.facebook && (
              <div
                onClick={() =>
                  window.open(organizer.socialLinks.facebook, "_blank")
                }
                className="cursor-pointer w-10 h-10 text-[rgba(229,114,0)] border border-[rgba(199,195,193)] rounded flex items-center justify-center"
              >
                <IoLogoFacebook className="w-6 h-6" />
              </div>
            )}
            {organizer.socialLinks.instagram && (
              <div
                onClick={() =>
                  window.open(organizer.socialLinks.instagram, "_blank")
                }
                className="cursor-pointer w-10 h-10 text-[rgba(229,114,0)] border border-[rgba(199,195,193)] rounded flex items-center justify-center"
              >
                <RiInstagramFill className="w-6 h-6" />
              </div>
            )}
          </div>
        </div>
      </div>{" "}
      <div>
        <h3 className="text-lg font-semibold text-[rgba(68,63,63)] mb-4">
          Dirección del Evento
        </h3>
        <StaticMapView location={location} onGetDirections={openInGoogleMaps} />
        <p className="text-sm text-[rgba(100,92,90)] mt-2">
          {location.address}
        </p>
      </div>
    </div>
  );
};

export default EventDetails;
