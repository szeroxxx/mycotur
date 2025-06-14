import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosConfig";
import { getMediaUrl } from "../utils/mediaHelpers";

interface RawEventDetailData {
  id: number;
  uuid: string;
  activityId: number;
  title: string;
  owner: string;
  category: string;
  categories?: string[];
  location: string;
  lat: string;
  lon: string;
  date: string;
  time: string;
  phone: string;
  email: string;
  link: string;
  fees: string;
  description: string;
  photos: { name: string; type: string }[];
  eventDates: {
    date: string;
    time: string;
  };
  organizer: {
    id: string;
    name: string;
    avatar?: string;
    eventsHosted: number;
    initials: string;
    socialLinks: {
      email: string;
      facebook: string;
      instagram: string;
      youtube: string;
    };
  };
}

export interface EventDetailData {
  id: string;
  title: string;
  photos: {
    id: string;
    url: string;
    alt: string;
    type: string;
  }[];
  totalPhotos: number;
  category: string;
  categories?: string[];
  eventDate: {
    date: string;
    time: string;
  };
  description: string;
  organizer: {
    id: string;
    name: string;
    eventsHosted: number;
    initials: string;
    avatar?: string;
    socialLinks: {
      email?: string;
      facebook?: string;
      instagram?: string;
      youtube?: string;
    };
  };
  location: {
    address: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  contact: {
    phone: string;
    email: string;
    fees: string;
    link?: string;
  };
}

export const useEventDetail = (uuid: string | undefined) => {
  const [eventData, setEventData] = useState<EventDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapEventDetailData = (data: RawEventDetailData): EventDetailData => {
    return {
      id: data.uuid,
      title: data.title,
      photos: data.photos.map((media, index) => ({
        id: (index + 1).toString(),
        url: getMediaUrl(media.name),
        alt: `${data.title} - Media ${index + 1}`,
        type: media.type,
      })),
      totalPhotos: data.photos.length,
      category: data.category,
      categories: data.categories || (data.category ? [data.category] : []),
      eventDate: data.eventDates,
      description: data.description,
      organizer: {
        id: data.organizer.id,
        name: data.organizer.name,
        avatar: data.organizer.avatar
          ? getMediaUrl(data.organizer.avatar)
          : undefined,
        eventsHosted: data.organizer.eventsHosted,
        initials: data.organizer.initials,
        socialLinks: {
          email: data.organizer.socialLinks.email || undefined,
          facebook: data.organizer.socialLinks.facebook || undefined,
          instagram: data.organizer.socialLinks.instagram || undefined,
          youtube: data.organizer.socialLinks.youtube || undefined,
        },
      },
      location: {
        address: data.location,
        coordinates: {
          lat: parseFloat(data.lat),
          lng: parseFloat(data.lon),
        },
      },
      contact: {
        phone: data.phone,
        email: data.email,
        fees: data.fees,
        link: data.link || undefined,
      },
    };
  };

  useEffect(() => {
    const fetchEventDetail = async () => {
      if (!uuid) return;
      try {
        setLoading(true);
        setError(null);
        const URL = process.env.NEXTAUTH_BACKEND_URL;
        const response = await axiosInstance.get(
          `${URL}/api/visitor/event-detail/${uuid}`
        );

        if (response.data && response.data.data) {
          const mappedData = mapEventDetailData(response.data.data);
          setEventData(mappedData);
        }
      } catch (err) {
        console.error("Error fetching event detail:", err);
        setError("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetail();
  }, [uuid]);

  return {
    eventData,
    loading,
    error,
  };
};
