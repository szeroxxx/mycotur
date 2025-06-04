import React, { useState } from "react";
import { RiInstagramFill } from "react-icons/ri";
import { IoLogoFacebook } from "react-icons/io5";
import { IoLogoYoutube } from "react-icons/io";
import { FiUser } from "react-icons/fi";
import ContactModal from "@/components/activity-detail/ContactModal";
import axiosInstance from "@/utils/axiosConfig";
import { getMediaUrl } from "@/utils/mediaHelpers";

interface OrganiserCardProps {
  // id: number;
  uuid: string;
  name: string;
  about: string | null;
  // address: string | null;
  email: string;
  facebook: string | null;
  instagram: string | null;
  youtube: string | null;
  categories: {
    id: number;
    title: string;
    description: string;
  }[];
  totalEvents: number;
  profileImage: string | null;
}

const OrganiserCard: React.FC<OrganiserCardProps> = ({
  // id,
  uuid,
  name,
  about,
  // address,
  email,
  facebook,
  instagram,
  youtube,
  categories,
  totalEvents,
  profileImage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);

  const shouldShowReadMore = (text: string | null) => {
    if (!text) return false;
    return text.length > 150;
  };

  const recordClick = async (organizerId: string) => {
    try {
      await axiosInstance.post("/api/clicks", {
        organizerId: organizerId,
      });
    } catch (error) {
      console.error("Failed to record click:", error);
    }
  };

  const handleOpen = async () => {
    await recordClick(uuid);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <div className="block h-full">
      <div className="rounded-xl bg-white shadow-sm overflow-hidden  hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
        {" "}
        <div className="p-4 flex flex-col h-full">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-20 h-20 rounded-md shrink-0 overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
              {profileImage ? (
                <img
                  src={getMediaUrl(profileImage)}
                  alt={`${name} profile`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <FiUser size={32} className="text-gray-400" />
              )}
            </div>

            <div className="space-y-2 flex-1 min-h-0">
              <h3 className="font-medium text-2xl text-[rgba(68,63,63)] line-clamp-2 min-h-[2.5rem]">
                {name}
              </h3>
              <div className="flex items-center text-xs text-gray-500">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="text-xs text-[rgba(100,92,90)]">
                  Total Event ({totalEvents})
                </span>
              </div>

              <div className="flex space-x-2">
                {youtube && (
                  <a href={youtube} target="_blank" rel="noopener noreferrer">
                    <IoLogoYoutube className="h-5 w-5 text-[rgba(229,114,0)] border-[0.5px] border-[rgba(235,235,235)] rounded" />
                  </a>
                )}
                {facebook && (
                  <a href={facebook} target="_blank" rel="noopener noreferrer">
                    <IoLogoFacebook className="h-5 w-5 text-[rgba(229,114,0)] border-[0.5px] border-[rgba(235,235,235)] rounded" />
                  </a>
                )}
                {instagram && (
                  <a href={instagram} target="_blank" rel="noopener noreferrer">
                    <RiInstagramFill className="h-5 w-5 text-[rgba(229,114,0)] border-[0.5px] border-[rgba(235,235,235)] rounded" />
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 mb-4 min-h-[3rem]">
            {(isExpanded ? categories : categories.slice(0, 4)).map(
              (category) => (
                <div
                  key={category.id}
                  className="text-xs text-[rgba(68,63,63)] line-clamp-1 border-[0.5px] border-[rgba(218,218,218)] rounded-lg px-2 py-1  hover:bg-[rgba(229,229,229)] transition-colors duration-200"
                >
                  {category.title}
                </div>
              )
            )}
            {categories.length > 4 && !isExpanded && (
              <div
                className="text-xs text-[rgba(100,92,90)] col-span-2 cursor-pointer hover:text-[rgba(229,114,0)] transition-colors duration-200"
                onClick={() => setIsExpanded(true)}
              >
                +{categories.length - 4} more categories
              </div>
            )}
            {isExpanded && (
              <div
                className="text-xs text-[rgba(100,92,90)] col-span-2 cursor-pointer hover:text-[rgba(229,114,0)] transition-colors duration-200"
                onClick={() => setIsExpanded(false)}
              >
                Show less
              </div>
            )}
          </div>{" "}
          <div className="flex-1 mb-4">
            <p
              className={`text-xs text-gray-600 leading-relaxed ${
                !isAboutExpanded ? "line-clamp-3" : ""
              }`}
            >
              {about || "No description available."}
            </p>
            {about && shouldShowReadMore(about) && (
              <button
                onClick={() => setIsAboutExpanded(!isAboutExpanded)}
                className="text-xs text-[rgba(100,92,90)] mt-1 cursor-pointer hover:text-[rgba(229,114,0)] transition-colors duration-200"
              >
                {isAboutExpanded ? "Show less" : "Read more"}
              </button>
            )}
          </div>
          <div className="mt-auto">
            <div className="block">
              <button
                onClick={handleOpen}
                className="cursor-pointer w-full py-3 bg-[rgba(68,63,63)] text-[rgba(255,255,255)]s text-sm rounded-md hover:bg-gray-700 transition-colors"
              >
                Get Contact Information
              </button>
            </div>
          </div>
        </div>
      </div>
      <ContactModal
        isOpen={isOpen}
        onClose={handleClose}
        contactInfo={{
          email: email,
          facebook: facebook || undefined,
          instagram: instagram || undefined,
          youtube: youtube || undefined,
        }}
      />
    </div>
  );
};

export default OrganiserCard;
