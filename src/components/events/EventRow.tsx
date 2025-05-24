import React from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import { Event } from "../../types/event";

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
  function formatDate(dateString: string): string {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const date = new Date(dateString);

    const day: number = date.getDate();
    const suffix: string = ((day: number): string => {
      if (day > 3 && day < 21) return "th";
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    })(day);

    return `${day}${suffix} ${
      date.toLocaleString("en-US", options).split(" ")[0]
    }, ${date.getFullYear()}`;
  }

  function formatTime(timeString: string): string {
    const [hours, minutes] = timeString.split(":").map(Number);

    const suffix = hours >= 12 ? "PM" : "AM";

    const formattedHours = hours % 12 || 12;
    const formattedMinutes = minutes.toString().padStart(2, "0");

    return `${formattedHours}:${formattedMinutes} ${suffix}`;
  }

  return (
    <tr className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB]">
      <td className="py-4 px-6 whitespace-nowrap text-sm text-[rgba(68,63,63)]">
        {event.activityName}
      </td>
      <td className="py-4 px-6 whitespace-nowrap text-sm text-[rgba(68,63,63)]">
        {event.event}
      </td>
      <td className="py-4 px-6 whitespace-nowrap text-sm text-[rgba(68,63,63)]">
        {formatDate(event.eventDate)}
      </td>
      <td className="py-4 px-6 whitespace-nowrap text-sm text-[rgba(68,63,63)]">
        {formatTime(event.eventTime)}
      </td>
      <td className="py-4 px-6 whitespace-nowrap text-sm text-[rgba(68,63,63)]">
        {event.category}
      </td>

      <td className="py-4 px-6 whitespace-nowrap text-sm text-[rgba(68,63,63)]">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => onEdit(event)}
            className="text-[rgba(68,63,63)] hover:text-[#111827] transition-colors"
          >
            <FiEdit2 size={16} />
          </button>
          <button
            onClick={() => onDelete(event)}
            className="text-[rgba(68,63,63)] hover:text-[#111827] transition-colors"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};
