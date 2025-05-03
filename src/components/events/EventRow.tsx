import React from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { Event } from '../../types/event';

interface EventRowProps {
  event: Event;
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
}

export const EventRow: React.FC<EventRowProps> = ({
  event,
  onEdit,
  onDelete
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <tr className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB]">
      <td className="py-4 px-6 whitespace-nowrap text-sm text-[#111827]">{event.activityName}</td>
      <td className="py-4 px-6 whitespace-nowrap text-sm text-[#6B7280]">{event.event}</td>
      <td className="py-4 px-6 whitespace-nowrap text-sm text-[#6B7280]">{formatDate(event.eventDate)}</td>
      <td className="py-4 px-6 whitespace-nowrap text-sm text-[#6B7280]">{event.eventTime}</td>
      <td className="py-4 px-6 whitespace-nowrap text-sm text-[#6B7280]">{event.category}</td>
      <td className="py-4 px-6 whitespace-nowrap text-sm text-[#6B7280]">{event.location}</td>
      <td className="py-4 px-6 whitespace-nowrap text-sm text-[#6B7280]">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => onEdit(event)}
            className="text-[#6B7280] hover:text-[#111827] transition-colors"
          >
            <FiEdit2 size={16} />
          </button>
          <button 
            onClick={() => onDelete(event)}
            className="text-[#6B7280] hover:text-[#111827] transition-colors"
          >
            <FiTrash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
};