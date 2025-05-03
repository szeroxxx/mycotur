import React from 'react';
import { Event } from '../../types/event';
import { EventRow } from '../events/EventRow';

interface EventListProps {
  events: Event[];
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
}

export const EventList: React.FC<EventListProps> = ({
  events,
  onEdit,
  onDelete
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-[#F3F4F6]">
        <thead className="bg-[#F9FAFB]">
          <tr>
            <th className="py-3.5 px-6 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
              Activity name
            </th>
            <th className="py-3.5 px-6 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
              Event
            </th>
            <th className="py-3.5 px-6 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
              Event Date
            </th>
            <th className="py-3.5 px-6 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
              Event Time
            </th>
            <th className="py-3.5 px-6 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
              Category
            </th>
            <th className="py-3.5 px-6 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
              Location
            </th>
            <th className="py-3.5 px-6 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-[#F3F4F6]">
          {events.map((event) => (
            <EventRow
              key={event.id}
              event={event}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};