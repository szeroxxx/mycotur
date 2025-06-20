export function convertDateToSpanish(dateStr: string): string {
  const monthTranslation: { [key: string]: string } = {
    January: "Enero",
    February: "Febrero",
    March: "Marzo",
    April: "Abril",
    May: "Mayo",
    June: "Junio",
    July: "Julio",
    August: "Agosto",
    September: "Septiembre",
    October: "Octubre",
    November: "Noviembre",
    December: "Diciembre",
  };
  const [day, month, year] = dateStr.split(" ");
  const monthSpanish = monthTranslation[month] || month;
  return `${day} ${monthSpanish} ${year}`;
}

export const spanishMonths = [
  { value: 1, name: "Enero" },
  { value: 2, name: "Febrero" },
  { value: 3, name: "Marzo" },
  { value: 4, name: "Abril" },
  { value: 5, name: "Mayo" },
  { value: 6, name: "Junio" },
  { value: 7, name: "Julio" },
  { value: 8, name: "Agosto" },
  { value: 9, name: "Septiembre" },
  { value: 10, name: "Octubre" },
  { value: 11, name: "Noviembre" },
  { value: 12, name: "Diciembre" },
];

export function formatMonthToSpanish(monthValue: string): string {
  if (!monthValue) return "";

  const [year, month] = monthValue.split("-");
  const monthNumber = parseInt(month, 10);
  const spanishMonth = spanishMonths.find((m) => m.value === monthNumber);

  return spanishMonth ? `${spanishMonth.name} ${year}` : monthValue;
}

export function parseSpanishMonth(
  displayValue: string,
  originalValue: string
): string {
  return originalValue;
}

export function getSpanishMonthName(monthValue: string | number): string {
  if (!monthValue) return "";

  let monthNumber: number;

  if (typeof monthValue === "string") {
    monthNumber = monthValue.includes("-")
      ? parseInt(monthValue.split("-")[1], 10)
      : parseInt(monthValue, 10);
  } else {
    monthNumber = monthValue;
  }

  const spanishMonth = spanishMonths.find((m) => m.value === monthNumber);
  return spanishMonth ? spanishMonth.name : monthValue.toString();
}
