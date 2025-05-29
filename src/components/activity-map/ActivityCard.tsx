import React from "react";
import { User, MapPin } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useRouter } from "next/router";

interface ActivityCardProps {
  id: number;
  title: string;
  user: string;
  location: string;
  category: string;
  image: string;
  isSelected: boolean;
  onClick: () => void;
}

const ActivityCard: React.FC<ActivityCardProps> = ({
  id,
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
    router.push(`/activity-details/${id}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className={`p-4 mb-3 bg-[rgba(255,255,255)] rounded-[16px] border cursor-pointer transition-all ${
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

      <div className="mt-4">
        <h3 className="text-[rgba(68,63,63)] text-lg font-medium">{title}</h3>
        <div className="flex items-center mt-2 text-[rgba(100,92,90)] text-sm">
          <User size={16} className="mr-2" />
          <span>{user}</span>
        </div>
        <div className="flex items-center mt-1 text-[rgba(100,92,90)] text-sm">
          <MapPin size={16} className="mr-2" />
          <span className="truncate">{location}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ActivityCard;
