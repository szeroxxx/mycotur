export type CalendarEvent = {
  uuid: string;
  title: string;
  date: string;
  time: string;
  location: string;
  owner: string;
  image: string;
  category: string;
  categories?: string[];
  description?: string;
  lat?: string;
  lon?: string;
};
