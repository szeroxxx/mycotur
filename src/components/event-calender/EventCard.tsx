import React from "react";
import { User, MapPin, Clock, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { useRouter } from "next/router";
import Image from "next/image";
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
}) => {
  const router = useRouter();
  const handleCardClick = () => {
    onClick();
    router.push(`/event-detail/${id}`);
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
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
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          className="absolute top-2 right-2 bg-[rgba(238,242,255)] text-[rgba(79,70,229)] text-xs px-2 py-1 rounded-[20px]"
        >
          {category}
        </motion.div>
      </div>

      <motion.div
        className="p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.h3
          whileHover={{ color: "#f97316" }}
          className="font-medium text-[rgba(22,21,37)] mb-2"
        >
          {title}
        </motion.h3>

        <motion.div className="space-y-2 text-sm">
          <motion.div
            className="flex items-center gap-2 text-[rgba(68,63,63)]"
            whileHover={{ x: 5 }}
          >
            <motion.div>
              <CalendarDays className="w-4 h-4 text-gray-500" />
            </motion.div>
            <span>{format(new Date(date), "MMM dd, yyyy")}</span>
            <motion.div>
              <Clock className="w-4 h-4 text-gray-500 ml-1" />
            </motion.div>
            <span> {time}</span>
          </motion.div>

          <motion.div className="flex items-center gap-2" whileHover={{ x: 5 }}>
            <motion.div>
              <User className="w-4 h-4 text-[rgba(68,63,63)]" />
            </motion.div>
            <span className="text-[rgba(68,63,63)] truncate">{owner}</span>
          </motion.div>

          <motion.div className="flex items-center gap-2" whileHover={{ x: 5 }}>
            <motion.div>
              <MapPin className="w-4 h-4 text-[rgba(68,63,63)]" />
            </motion.div>
            <span className="text-gray-600 truncate">{location}</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default EventCard;
