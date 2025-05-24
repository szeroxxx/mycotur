import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Event } from "../../types/event";
import { EventRow } from "../events/EventRow";

interface EventListProps {
  profileStatus: {
    needsUpdate: boolean;
    fields: string[];
    message: string;
  } | null;
  events: Event[];
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
}

export const EventList: React.FC<EventListProps> = ({
  profileStatus,
  events,
  onEdit,
  onDelete,
}) => {
  const [isAgent, setIsAgent] = useState(false);

  useEffect(() => {
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const parsedUserData = JSON.parse(userData);
        setIsAgent(parsedUserData.role === "agent");
      }
    } catch (err) {
      console.error("Error checking user role:", err);
    }
  }, []);
  if (isAgent && profileStatus?.needsUpdate) {
    return (
      <div
        className="bg-[rgba(255,255,255)] border border-red-400 text-red-700 p-4 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Profile Incomplete</strong>
        <span className="block sm:inline">
          {" "}
          Please complete your profile before adding events.
        </span>
        <div>
          <span className="block sm:inline"> {profileStatus?.message}</span>
        </div>
      </div>
    );
  }
  if (events.length === 0) {
    return (
      <div className="bg-[rgba(255,255,255)] rounded-[16px] p-8 text-center">
        {" "}
        <Image
          src="/file.svg"
          alt="No Events"
          width={80}
          height={80}
          className="mx-auto mb-4 opacity-50"
        />
        <h3 className="text-lg font-medium text-[rgba(68,63,63)] mb-2">
          No Event Found
        </h3>
        <p className="text-sm text-[rgba(100,92,90)]">
          {" "}
          There are no Event added yet. Click the &quot;Add Event&quot; button
          to create one.
        </p>
      </div>
    );
  }
  return (
    <div className="flex flex-col rounded-[16px] max-h-[calc(100vh-220px)]">
      <div className="overflow-x-auto scrollbar-hide rounded-[16px]">
        <div className="inline-block min-w-full rounded-[16px]">
          <div className="overflow-hidden rounded-[16px]">
            <table className="min-w-full divide-y divide-[#F3F4F6] rounded-[16px] overflow-hidden">
              <thead className="bg-[rgba(244,242,242)] sticky top-0 z-10">
                <tr>
                  <th className="py-3.5 px-6 text-left text-xs font-medium text-[rgba(100,92,90)] uppercase tracking-wider bg-[rgba(244,242,242)]">
                    Activity name
                  </th>
                  <th className="py-3.5 px-6 text-left text-xs font-medium text-[rgba(100,92,90)] uppercase tracking-wider bg-[rgba(244,242,242)]">
                    Event
                  </th>
                  <th className="py-3.5 px-6 text-left text-xs font-medium text-[rgba(100,92,90)] uppercase tracking-wider bg-[rgba(244,242,242)]">
                    Event Date
                  </th>
                  <th className="py-3.5 px-6 text-left text-xs font-medium text-[rgba(100,92,90)] uppercase tracking-wider bg-[rgba(244,242,242)]">
                    Event Time
                  </th>
                  <th className="py-3.5 px-6 text-left text-xs font-medium text-[rgba(100,92,90)] uppercase tracking-wider bg-[rgba(244,242,242)]">
                    Category
                  </th>
                  <th className="py-3.5 px-6 text-left text-xs font-medium text-[rgba(100,92,90)] uppercase tracking-wider bg-[rgba(244,242,242)]">
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
        </div>
      </div>
    </div>
  );
};
