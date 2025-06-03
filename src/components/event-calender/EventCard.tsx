import React from "react";
import { User, MapPin, Clock, CalendarDays } from "lucide-react";
import { format } from "date-fns";
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
  isSelected,
  onClick,
}) => {  const router = useRouter();
  const handleCardClick = () => {
    onClick();
    router.push(createEventUrl(title, id));
  };

  return (
    <div
      className={`bg-[rgba(255,255,255)] rounded-[16px] shadow-sm cursor-pointer transition-all border ${
        isSelected
          ? "border-[rgba(194,91,52)] shadow-md"
          : "border-[#E5E7EB] hover:border-[rgba(194,91,52)]"
      }`}
      onClick={handleCardClick}
    >
      <div className="relative h-40">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover rounded-[8px]"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/default-activity-image.png";
          }}
        />
        <div className="absolute top-2 right-2 bg-[rgba(238,242,255)] text-[rgba(79,70,229)] text-xs px-2 py-1 rounded-[20px]">
          {category}
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-medium text-[rgba(22,21,37)] mb-2">
          {title}
        </h3>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-[rgba(68,63,63)]">
            <CalendarDays className="w-4 h-4 text-gray-500" />
            <span>{format(new Date(date), "MMM dd, yyyy")}</span>
            <Clock className="w-4 h-4 text-gray-500 ml-1" />
            <span>{time}</span>
          </div>

          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[rgba(68,63,63)]" />
            <span className="text-[rgba(68,63,63)] truncate">{owner}</span>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[rgba(68,63,63)]" />
            <span className="text-gray-600 truncate">{location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
