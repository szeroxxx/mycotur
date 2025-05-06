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
    <div className="overflow-x-auto rounded-[16px]">
      <table className="min-w-full divide-y divide-[#F3F4F6]">
        <thead className="bg-[rgba(244,242,242)]">
          <tr>
            <th className="py-3.5 px-6 text-left text-xs font-medium text-[rgba(100,92,90)] uppercase tracking-wider">
              Activity name
            </th>
            <th className="py-3.5 px-6 text-left text-xs font-medium text-[rgba(100,92,90)] uppercase tracking-wider">
              Event
            </th>
            <th className="py-3.5 px-6 text-left text-xs font-medium text-[rgba(100,92,90)] uppercase tracking-wider">
              Event Date
            </th>
            <th className="py-3.5 px-6 text-left text-xs font-medium text-[rgba(100,92,90)] uppercase tracking-wider">
              Event Time
            </th>
            <th className="py-3.5 px-6 text-left text-xs font-medium text-[rgba(100,92,90)] uppercase tracking-wider">
              Category
            </th>
            <th className="py-3.5 px-6 text-left text-xs font-medium text-[rgba(100,92,90)] uppercase tracking-wider">
              Location
            </th>
            <th className="py-3.5 px-6 text-left text-xs font-medium text-[rgba(100,92,90)] uppercase tracking-wider">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-[rgba(255,255,255)] divide-y divide-[#F3F4F6]">
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