import React from "react";
import { User, MapPin, Clock, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useRouter } from "next/router";
import Image from "next/image";
import { createEventUrl } from "../../utils/urlHelpers";

interface EventCardProps {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  owner: string;
  image: string;
  isSelected: boolean;
  category: string;
  categories?: string[];
  onClick: () => void;
}

const EventCard: React.FC<EventCardProps> = ({
  id,
  image,
  title,
  date,
  time,
  location,
  owner,
  category,
  categories,
  isSelected,
  onClick,
}) => {
  const displayCategories =
    categories && categories.length > 0
      ? categories
      : category
      ? [category]
      : [];
  const hasMultipleCategories = displayCategories.length > 1;

  const router = useRouter();

  const handleCardClick = () => {
    onClick();
    router.push(createEventUrl(title, id));
  };

  const timeString = time;
  const [hours, minutes] = timeString.split(":");
  const hour24 = parseInt(hours);
  const hour12 = hour24 % 12 || 12;
  const ampm = hour24 >= 12 ? "PM" : "AM";
  const formattedTime = `${hour12}:${minutes} ${ampm}`;

  return (
    <div
      className={`event-card-mobile p-3 sm:p-4 mb-3 rounded-2xl border cursor-pointer transition-all duration-300 ${
        isSelected
          ? "border-[rgba(194,91,52)] shadow-xl ring-2 ring-[rgba(194,91,52,0.2)] bg-gradient-to-br from-orange-50 to-white transform"
          : "border-[rgba(226,225,223,0.4)] hover:border-[rgba(194,91,52,0.6)] shadow-md"
      }`}
      onClick={handleCardClick}
    >
      <div className="relative w-full aspect-[402/252] min-h-[180px] max-h-[252px]">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 480px) 95vw, (max-width: 640px) 90vw, (max-width: 768px) 45vw, (max-width: 1024px) 30vw, (max-width: 1280px) 25vw, 402px"
          className="rounded-xl object-cover"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/default-activity-image.png";
          }}
        />

        <div className="absolute top-2 right-2">
          {displayCategories.length > 0 && (
            <div
              className="bg-gradient-to-r from-[rgba(238,242,255)] to-[rgba(248,250,252)] text-[rgba(79,70,229)] text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-sm border border-[rgba(79,70,229,0.1)] relative group"
              title={
                hasMultipleCategories
                  ? displayCategories.join(", ")
                  : displayCategories[0]
              }
            >
              <span className="font-medium">
                {hasMultipleCategories
                  ? `${displayCategories[0]} + ${
                      displayCategories.length - 1
                    } más`
                  : displayCategories[0]}
              </span>
            </div>
          )}
        </div>

        {isSelected && (
          <div className="absolute top-2 left-2 bg-[rgba(194,91,52)] text-white text-xs px-2 py-1 rounded-full shadow-sm">
            <span className="font-medium">Seleccionado</span>
          </div>
        )}
      </div>

      <div className="mt-3 sm:mt-4">
        <h3 className="text-[rgba(68,63,63)] text-sm sm:text-base md:text-lg font-semibold leading-tight mb-2 line-clamp-2">
          {title}
        </h3>

        <div className="space-y-1.5">
          <div className="flex items-center text-[rgba(100,92,90)] text-xs sm:text-sm">
            <CalendarDays size={14} className="mr-2 flex-shrink-0" />
            <span className="font-medium">
              {format(new Date(date), "MMM dd", { locale: es })}
            </span>
            <Clock size={14} className="ml-3 mr-1 flex-shrink-0" />
            <span>{formattedTime}</span>
          </div>

          <div className="flex items-center text-[rgba(100,92,90)] text-xs sm:text-sm">
            <User size={14} className="mr-2 flex-shrink-0" />
            <span className="truncate font-medium">{owner}</span>
          </div>

          <div className="flex items-center text-[rgba(100,92,90)] text-xs sm:text-sm">
            <MapPin size={14} className="mr-2 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
