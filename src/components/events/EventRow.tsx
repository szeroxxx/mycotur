import React, { useState, useRef, useEffect } from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { Event } from "../../types/event";
import { createEventUrl } from "../../utils/urlHelpers";
import { convertDateToSpanish } from "../../utils/dateHelpers";

interface EventRowProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
}

export const EventRow: React.FC<EventRowProps> = ({
  event,
  onEdit,
  onDelete,
}) => {
  const [showCategoryPopup, setShowCategoryPopup] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const moreButtonRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        moreButtonRef.current &&
        !moreButtonRef.current.contains(event.target as Node)
      ) {
        setShowCategoryPopup(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowCategoryPopup(!showCategoryPopup);
  };
  // function formatDate(dateString: string): string {
  //   const options: Intl.DateTimeFormatOptions = {
  //     year: "numeric",
  //     month: "long",
  //     day: "numeric",
  //   };
  //   const date = new Date(dateString);

  //   const day: number = date.getDate();
  //   const suffix: string = ((day: number): string => {
  //     if (day > 3 && day < 21) return "th";
  //     switch (day % 10) {
  //       case 1:
  //         return "st";
  //       case 2:
  //         return "nd";
  //       case 3:
  //         return "rd";
  //       default:
  //         return "th";
  //     }
  //   })(day);

  //   return `${day}${suffix} ${
  //     date.toLocaleString("en-US", options).split(" ")[0]
  //   }, ${date.getFullYear()}`;
  // }

  function formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(":").map(Number);

    const suffix = hours >= 12 ? "PM" : "AM";

    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, "0");

    return `${formattedHours}:${formattedMinutes} ${suffix}`;
  }

  const categories =
    event.categories || (event.category ? [event.category] : []);
  // const displayCategory =
  //   categories.length > 1
  //     ? `${categories[0]} + ${categories.length - 1} more`
  //     : categories[0] || event.category || "";

  console.log("event.eventDate::: ", event.eventDate);
  const eventDate = new Date(event.eventDate);
  const formattedDate = eventDate.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <tr className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB]">
      {" "}
      <td className="py-4 px-6 whitespace-nowrap text-sm text-[rgba(68,63,63)]">
        {event.activityName || "-"}
      </td>
      {/* <td className="py-4 px-6 whitespace-nowrap text-sm text-[rgba(68,63,63)]">
        {event.event}
      </td> */}
      <td className="py-4 px-6 text-sm text-[#82abcb] max-w-xs">
        <a
          href={createEventUrl(event.event, event.id)}
          rel="noopener noreferrer"
          className="cursor-pointer hover:text-[#111827] hover:underline transition-colors"
          title={event.event}
        >
          {event.event}
        </a>
      </td>
      <td className="py-4 px-6 whitespace-nowrap text-sm text-[rgba(68,63,63)]">
        {convertDateToSpanish(formattedDate)}
      </td>
      <td className="py-4 px-6 whitespace-nowrap text-sm text-[rgba(68,63,63)]">
        {formatTime(event.eventTime)}
      </td>{" "}
      <td className="py-4 px-6 text-sm text-[rgba(68,63,63)] max-w-xs relative">
        <div className="truncate" title={(categories || []).join(", ")}>
          {categories.length > 0 ? (
            categories.length === 1 ? (
              categories[0]
            ) : (
              <>
                {categories[0]} +
                <span
                  ref={moreButtonRef}
                  onClick={handleMoreClick}
                  className="text-[#82abcb] hover:text-[#111827] cursor-pointer underline ml-1"
                >
                  {categories.length - 1} more
                </span>
              </>
            )
          ) : (
            "No categories"
          )}
        </div>

        {showCategoryPopup && categories && categories.length > 1 && (
          <div
            ref={popupRef}
            className="fixed z-[9999] p-3 bg-white border border-gray-200 rounded-lg shadow-xl min-w-[200px] max-w-[300px]"
            style={{
              top: moreButtonRef.current
                ? moreButtonRef.current.getBoundingClientRect().bottom +
                  window.scrollY +
                  8
                : "100%",
              left: moreButtonRef.current
                ? moreButtonRef.current.getBoundingClientRect().left +
                  window.scrollX
                : "0",
            }}
          >
            <div className="text-xs font-medium text-gray-700 mb-2">
              All Categories:
            </div>
            <div className="space-y-1">
              {categories.map((category, index) => (
                <div
                  key={index}
                  className="text-sm text-gray-600 py-1 px-2 bg-gray-50 rounded hover:bg-gray-100 transition-colors"
                >
                  {category}
                </div>
              ))}
            </div>
            <div
              className="absolute w-3 h-3 bg-white border-l border-t border-gray-200 transform rotate-45"
              style={{
                top: "-6px",
                left: "16px",
              }}
            ></div>
          </div>
        )}
      </td>
      <td className="py-4 px-6 whitespace-nowrap text-sm text-[rgba(68,63,63)]">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onEdit(event)}
            className="text-[rgba(68,63,63)] hover:text-[#111827] transition-colors cursor-pointer"
          >
            <FiEdit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(event)}
            className="text-[rgba(68,63,63)] hover:text-[#111827] transition-colors cursor-pointer"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};
