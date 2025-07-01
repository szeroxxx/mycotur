import React, { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
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
  parseISO,
} from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/utils/utils";

interface SpanishDatePickerProps {
  value?: string;
  onChange: (value: string) => void;
  name: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

const SpanishDatePicker: React.FC<SpanishDatePickerProps> = ({
  value = "",
  onChange,
  name,
  required = false,
  className = "",
  placeholder = "Seleccionar fecha",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    value ? parseISO(value) : new Date()
  );
  const [selectedDate, setSelectedDate] = useState<Date | null>(
    value ? parseISO(value) : null
  );

  const containerRef = useRef<HTMLDivElement>(null);

  const getDisplayText = () => {
    if (!value || !selectedDate) return placeholder;
    return format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: es });
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const isoString = format(date, "yyyy-MM-dd");
    onChange(isoString);
    setIsOpen(false);
  };

  const handleTodayClick = () => {
    const today = new Date();
    handleDateClick(today);
    setCurrentMonth(today);
  };

  const handleClearClick = () => {
    setSelectedDate(null);
    onChange("");
    setIsOpen(false);
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const renderHeader = () => {
    return (
      <div className="flex items-center justify-between p-3 border-b">
        <button
          type="button"
          onClick={prevMonth}
          className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-900"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-sm font-medium text-gray-900">
          {format(currentMonth, "MMMM yyyy", { locale: es })}
        </h3>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1 hover:bg-gray-100 rounded transition-colors text-gray-900"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    );
  };

  const renderDays = () => {
    const days = ["L", "M", "X", "J", "V", "S", "D"];
    return (
      <div className="grid grid-cols-7 gap-1 p-2 border-b">
        {days.map((day, i) => (
          <div
            key={i}
            className="text-center text-xs font-medium text-gray-600 py-2"
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
        const isCurrentDay = isToday(day);
        const isSelected = selectedDate && isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, monthStart);

        days.push(
          <button
            key={day.toString()}
            type="button"
            className={cn(
              "w-8 h-8 text-xs flex items-center justify-center transition-colors rounded",
              !isCurrentMonth ? "text-gray-300" : "text-gray-700",
              isCurrentDay && !isSelected ? "bg-blue-100 text-blue-600 font-medium" : "",
              isSelected ? "bg-[#D45B20] text-white" : "hover:bg-gray-100",
              !isCurrentMonth ? "hover:bg-transparent" : ""
            )}
            onClick={() => isCurrentMonth && handleDateClick(cloneDay)}
            disabled={!isCurrentMonth}
          >
            {dateFormatted}
          </button>
        );

        day = addDays(day, 1);
      }

      rows.push(
        <div key={day.toString()} className="grid grid-cols-7 gap-1 px-2">
          {days}
        </div>
      );

      days = [];
    }

    return <div className="space-y-1">{rows}</div>;
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <div
        className={cn(
          "w-full px-4 py-2 text-[rgba(142,133,129)] border border-[#E5E7EB] rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#D45B20] focus:border-[#D45B20] cursor-pointer flex items-center justify-between",
          className
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "text-gray-700" : "text-gray-400"}>
          {getDisplayText()}
        </span>
        <Calendar className="h-4 w-4 text-gray-400" />
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {renderHeader()}
          {renderDays()}
          {renderCells()}
          
          {/* Footer with Clear and Today buttons */}
          <div className="flex justify-between items-center p-3 border-t bg-gray-50">
            <button
              type="button"
              onClick={handleClearClick}
              className="text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              Limpiar
            </button>
            <button
              type="button"
              onClick={handleTodayClick}
              className="text-sm text-[#D45B20] hover:text-[#C44D16] transition-colors font-medium"
            >
              Hoy
            </button>
          </div>
        </div>
      )}

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name={name}
        value={value}
        required={required}
      />
    </div>
  );
};

export default SpanishDatePicker;
