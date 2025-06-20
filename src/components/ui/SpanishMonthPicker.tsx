import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { spanishMonths } from "../../utils/dateHelpers";

interface SpanishMonthPickerProps {
  value: string;
  onChange: (value: string) => void;
  name: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

const SpanishMonthPicker: React.FC<SpanishMonthPickerProps> = ({
  value,
  onChange,
  name,
  required = false,
  className = "",
  placeholder = "Seleccionar mes",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(() => {
    if (value) {
      const monthValue = value.includes("-") ? value.split("-")[1] : value;
      return parseInt(monthValue, 10);
    }
    return null;
  });

  const dropdownRef = useRef<HTMLDivElement>(null);

  const getDisplayText = () => {
    if (!value) return placeholder;

    const monthValue = value.includes("-") ? value.split("-")[1] : value;
    const monthNumber = parseInt(monthValue, 10);
    const spanishMonth = spanishMonths.find((m) => m.value === monthNumber);

    return spanishMonth ? spanishMonth.name : value;
  };

  const handleSelection = (month: number) => {
    const formattedValue = month.toString().padStart(2, "0");
    setSelectedMonth(month);
    onChange(formattedValue);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`${className} flex items-center justify-between cursor-pointer`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "text-[rgba(142,133,129)]" : "text-gray-400"}>
          {getDisplayText()}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-[rgba(142,133,129)] transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>{" "}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-[#E5E7EB] rounded-lg shadow-lg max-h-80 overflow-hidden">
          <div className="p-2 bg-gray-50 text-sm font-medium text-[rgba(68,63,63)] border-b border-[#E5E7EB]">
            Seleccionar Mes
          </div>
          <div className="max-h-60 overflow-y-auto scrollbar-hide">
            {spanishMonths.map((month) => (
              <div
                key={month.value}
                className={`p-2 text-sm cursor-pointer hover:bg-[#D45B20]/10 ${
                  selectedMonth === month.value
                    ? "bg-[#D45B20]/20 text-[#D45B20] font-medium"
                    : "text-[rgba(68,63,63)]"
                }`}
                onClick={() => handleSelection(month.value)}
              >
                {month.name}
              </div>
            ))}
          </div>
        </div>
      )}
      <input type="hidden" name={name} value={value} required={required} />
    </div>
  );
};

export default SpanishMonthPicker;
