
export function convertDateToSpanish(dateStr: string): string {
    const monthTranslation: { [key: string]: string } = {
        "January": "Enero",
        "February": "Febrero", 
        "March": "Marzo",
        "April": "Abril",
        "May": "Mayo",
        "June": "Junio",
        "July": "Julio",
        "August": "Agosto",
        "September": "Septiembre",
        "October": "Octubre",
        "November": "Noviembre",
        "December": "Diciembre"
    };
    const [day, month, year] = dateStr.split(" ");
    const monthSpanish = monthTranslation[month] || month;
    return `${day} ${monthSpanish} ${year}`;
}
