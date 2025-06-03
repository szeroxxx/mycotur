import React from "react";
import { User, MapPin } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/router";
import { createActivityUrl } from "../../utils/urlHelpers";

interface ActivityCardProps {
  id: string;
  uuid: string;
  title: string;
  user: string;
  location: string;
  category: string;
  image: string;
  isSelected: boolean;
  onClick: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  // id,
  uuid,
  title,
  user,
  location,
  category,
  image,
  isSelected,
  onClick,
}) => {
  const router = useRouter();

  const handleCardClick = () => {
    onClick();
    router.push(createActivityUrl(title, uuid));
  };  return (
    <div
      className={`activity-card-mobile p-3 sm:p-4 mb-3 rounded-2xl border cursor-pointer transition-all duration-300 hover:shadow-xl active:scale-[0.98] ${
        isSelected
          ? "border-[rgba(194,91,52)] shadow-xl ring-2 ring-[rgba(194,91,52,0.2)] bg-gradient-to-br from-orange-50 to-white transform scale-[1.02]"
          : "border-[rgba(226,225,223,0.4)] hover:border-[rgba(194,91,52,0.6)] shadow-md hover:scale-[1.01]"
      }`}
      onClick={handleCardClick}
    >
      <div className="relative h-28 xs:h-32 sm:h-36 md:h-40">
        <Image
          src={image}
          alt={title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover rounded-xl"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "/default-activity-image.png";
          }}
        />
        <div className="absolute top-2 right-2 bg-gradient-to-r from-[rgba(238,242,255)] to-[rgba(248,250,252)] text-[rgba(79,70,229)] text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-sm border border-[rgba(79,70,229,0.1)]">
          <span className="font-medium">{category}</span>
        </div>
        {isSelected && (
          <div className="absolute top-2 left-2 bg-[rgba(194,91,52)] text-white text-xs px-2 py-1 rounded-full shadow-sm">
            <span className="font-medium">Selected</span>
          </div>
        )}
      </div>

      <div className="mt-3 sm:mt-4">
        <h3 className="text-[rgba(68,63,63)] text-sm sm:text-base md:text-lg font-semibold leading-tight mb-2 line-clamp-2">
          {title}
        </h3>
        <div className="space-y-1.5">
          <div className="flex items-center text-[rgba(100,92,90)] text-xs sm:text-sm">
            <User size={14} className="mr-2 flex-shrink-0 text-[rgba(194,91,52)]" />
            <span className="truncate font-medium">{user}</span>
          </div>
          <div className="flex items-center text-[rgba(100,92,90)] text-xs sm:text-sm">
            <MapPin size={14} className="mr-2 flex-shrink-0 text-[rgba(194,91,52)]" />
            <span className="truncate">{location}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
