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
      <div className="flex items-center justify-between p-4 lg:p-6  bg-gradient-to-r from-white to-gray-50">
        <button
          onClick={prevMonth}
          className="p-2 lg:p-3 hover:bg-gray-100 rounded-full transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          <ChevronLeft className="h-5 w-5 lg:h-6 lg:w-6 text-[rgba(68,63,63)]" />
        </button>
        <h2 className="text-lg lg:text-xl font-semibold text-[rgba(68,63,63)]">
          {format(currentMonth, "MMMM yyyy")}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 lg:p-3 hover:bg-gray-100 rounded-full transition-colors duration-200 shadow-sm hover:shadow-md"
        >
          <ChevronRight className="h-5 w-5 lg:h-6 lg:w-6 text-[rgba(68,63,63)]" />
        </button>
      </div>
    );
  };
  const renderDays = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return (
      <div className="flex w-full">
        {days.map((day, i) => (
          <div
            key={i}
            className="flex-1 text-center py-3 lg:py-4 text-gray-600 text-xs lg:text-sm font-semibold uppercase tracking-wider bg-gray-50"
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
              "m-[0.5px] relative flex-1 min-h-[60px] lg:min-h-[80px] flex items-center justify-center cursor-pointer  hover:bg-gray-50 transition-colors duration-200",
              !isCurrentMonth ? "text-gray-300" : "",
              isSelected
                ? "bg-[rgba(168,193,135)] text-white hover:bg-[rgba(148,173,115)]"
                : "",
              hasEvents && !isSelected
                ? "bg-[rgba(229,114,0)] text-white hover:bg-[rgba(209,94,0)]"
                : "",
              !isSelected && isCurrentMonth && !hasEvents
                ? "text-[rgba(100,92,90)] hover:bg-gray-50"
                : "",
              hasEvents && isSelected
                ? "bg-[rgba(168,193,135)] text-white"
                : "",
              isCurrentDay && !isSelected ? "font-bold" : ""
            )}
            onClick={() => isCurrentMonth && onDateSelect(cloneDay)}
          >
            <span className="text-sm lg:text-base font-medium">
              {dateFormatted}
            </span>
          </div>
        );

        day = addDays(day, 1);
      }

      rows.push(
        <div key={day.toString()} className="flex w-full">
          {days}
        </div>
      );

      days = [];
    }

    return <div className="flex-1 flex flex-col">{rows}</div>;
  };
  return (
    <div className="h-full flex flex-col bg-white rounded-lg lg:rounded-none overflow-hidden shadow-sm">
      {renderHeader()}
      {renderDays()}
      {renderCells()}
    </div>
  );
};

export default EventCalendar;
