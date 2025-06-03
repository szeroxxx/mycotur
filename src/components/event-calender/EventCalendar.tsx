import React, { useState } from "react";
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/utils/utils";

type EventType = {
  id: string;
  date: Date;
  title: string;
  hasEvent?: boolean;
};

interface EventCalendarProps {
  events: EventType[];
  onDateSelect: (date: Date) => void;
  selectedDate?: Date;
  checkDateHasEvent?: (date: Date) => boolean;
}

const EventCalendar: React.FC<EventCalendarProps> = ({
  events,
  onDateSelect,
  selectedDate,
  checkDateHasEvent,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft className="h-5 w-5 text-[rgba(68,63,63)]" />
        </button>
        <h2 className="text-lg font-medium text-[rgba(68,63,63)]">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <button
          onClick={nextMonth}
          className="p-1 hover:bg-gray-100 rounded-full"
        >
          <ChevronRight className="h-5 w-5 text-[rgba(68,63,63)]" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
    return (
      <div className="grid grid-cols-7 mb-2">
        {days.map((day, i) => (
          <div
            key={i}
            className="text-center py-2 text-gray-500 text-xs font-medium"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = new Date(day);
        const dateFormatted = format(day, "d");
        const hasEvents = checkDateHasEvent
          ? checkDateHasEvent(cloneDay)
          : events.some((event) => isSameDay(event.date, day));

        const isCurrentDay = isToday(day);
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <div
            key={day.toString()}
            className={cn(
              "relative h-30 flex items-center justify-center cursor-pointer",
              !isCurrentMonth ? "" : "",
              isSelected
                ? "bg-[rgba(168,193,135)] text-[rgba(255,255,255)]"
                : "",
              hasEvents && !isSelected ? "bg-[rgba(229,114,0)]" : "",
              !isSelected && isCurrentMonth && !hasEvents
                ? "text-[rgba(100,92,90)]"
                : "",
              hasEvents && isSelected
                ? "bg-[rgba(168,193,135)] text-[rgba(255,255,255)]"
                : "",
              isCurrentDay && !isSelected ? "font-bold" : ""
            )}
            onClick={() => isCurrentMonth && onDateSelect(cloneDay)}
          >
            <span className="text-base">{dateFormatted}</span>
          </div>
        );

        day = addDays(day, 1);
      }

      rows.push(
        <div key={day.toString()} className="grid grid-cols-7">
          {days}
        </div>
      );

      days = [];
    }

    return <div className="space-y-px">{rows}</div>;
  };

  return (
    <div className="bg-white p-6 rounded-xl">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default EventCalendar;