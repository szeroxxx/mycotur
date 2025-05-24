import React from "react";
import { User, MapPin, Clock, CalendarDays } from "lucide-react";
import { format } from "date-fns";
import { motion } from "framer-motion";

interface EventCardProps {
  id: string;
  media: string;
  title: string;
  date: string;
  time: string;
  location: string;
  owner: string;
  isSelected: boolean;
  onClick: () => void;
}

const EventCard: React.FC<EventCardProps> = ({
  media,
  title,
  date,
  time,
  location,
  owner,
  isSelected,
  onClick,
}) => {
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
      onClick={onClick}
    >
      <div className="relative h-40">
        <motion.img
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.3 }}          src={`http://localhost:3500/${media}`}
          alt={title}
          className="w-full h-full object-cover"
        />
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          whileHover={{ scale: 1.1 }}
          className="absolute top-2 right-2 bg-[rgba(238,242,255)] text-[rgba(79,70,229)] text-xs px-2 py-1 rounded-[20px]"
        >
          Experience
        </motion.div>
      </div>

      <motion.div
        className="p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <motion.h3
          whileHover={{ scale: 1.02, color: "#f97316" }}
          className="font-medium text-[rgba(22,21,37)] mb-2"
        >
          {title}
        </motion.h3>

        <motion.div
          className="space-y-2 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <motion.div
            className="flex items-center gap-2 text-[rgba(68,63,63)]"
            whileHover={{ x: 5 }}
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <CalendarDays className="w-4 h-4 text-gray-500" />
            </motion.div>
            <span>{format(new Date(date), "MMM dd, yyyy")}</span>
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <Clock className="w-4 h-4 text-gray-500 ml-1" />
            </motion.div>
            <span> {time}</span>
          </motion.div>

          <motion.div
            className="flex items-center gap-2"
            whileHover={{ x: 5 }}
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
              <User className="w-4 h-4 text-[rgba(68,63,63)]" />
            </motion.div>
            <span className="text-[rgba(68,63,63)] truncate">{owner}</span>
          </motion.div>

          <motion.div
            className="flex items-center gap-2"
            whileHover={{ x: 5 }}
          >
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
            >
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
