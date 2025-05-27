
export interface EventDate {
  id: string;
  date: string;
  time: string;
}

export interface Organizer {
  id: string;
  name: string;
  eventsHosted: number;
  avatar?: string;
  initials: string;
  socialLinks: {
    email?: string;
    facebook?: string;
    instagram?: string;
  };
}

export interface Location {
  address: string;
  mapImageUrl?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Photo {
  id: string;
  url: string;
  alt: string;
}

export interface Seasons {
  availableMonths: string;
  unavailableMonths?: string;
}

export interface Description {
  main: string;
  additional?: string;
}

export interface Contact {
  phone: string;
  email: string;
  fees: string;
}

export interface RSVPFormData {
  firstName: string;
  phoneNumber: string;
  email: string;
  numberOfPeople: string;
  message: string;
}

export interface ActivityDetailData {
  id: string;
  title: string;
  photos: Photo[];
  totalPhotos?: number;
  category?: string;
  eventDates: EventDate[];
  seasons: Seasons;
  description: Description;
  organizer: Organizer;
  location: Location;
  contact?: Contact;
}
