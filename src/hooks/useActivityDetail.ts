import { useState, useEffect } from "react";
import axios from "axios";
import { getMediaUrl } from "../utils/mediaHelpers";

// Interface for the raw activity detail data from the API
interface RawActivityDetailData {
  id: number;
  uuid: string;
  title: string;
  owner: string;
  category: string;
  location: string;
  lat: string;
  lon: string;
  startMonth: string;
  endMonth: string;
  phone: string;
  email: string;
  link: string;
  fees: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  isDelete: boolean;
  photos: string[];
  eventDates: {
    id: string;
    date: string;
    time: string;
  }[];
  organizer: {
    id: string;
    name: string;
    eventsHosted: number;
    initials: string;
    socialLinks: {
      email: string;
      facebook: string;
      instagram: string;
    };
  };
}

export interface ActivityDetailData {
  id: string;
  title: string;
  photos: {
    id: string;
    url: string;
    alt: string;
  }[];
  totalPhotos: number;
  category: string;
  eventDates: {
    id: string;
    date: string;
    time: string;
  }[];
  seasons: {
    availableMonths: string;
    unavailableMonths?: string;
  };
  description: {
    main: string;
  };
  organizer: {
    id: string;
    name: string;
    eventsHosted: number;
    initials: string;
    socialLinks: {
      email?: string;
      facebook?: string;
      instagram?: string;
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
  };
}

export const useActivityDetail = (uuid: string | undefined) => {
  const [activityData, setActivityData] = useState<ActivityDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Map raw API data to frontend structure
  const mapActivityDetailData = (data: RawActivityDetailData): ActivityDetailData => {
    return {
      id: data.uuid,
      title: data.title,
      photos: data.photos.map((photo, index) => ({
        id: (index + 1).toString(),
        url: getMediaUrl(photo),
        alt: `${data.title} - Photo ${index + 1}`,
      })),
      totalPhotos: data.photos.length,
      category: data.category,
      eventDates: data.eventDates || [],
      seasons: {
        availableMonths: `${data.title} adventure can be organised in between ${new Date(data.startMonth).toLocaleDateString('en-US', { month: 'long' })} to ${new Date(data.endMonth).toLocaleDateString('en-US', { month: 'long' })} (best prefer time from organiser)`,
        unavailableMonths: undefined,
      },
      description: {
        main: data.description,
      },
      organizer: {
        id: data.organizer.id,
        name: data.organizer.name,
        eventsHosted: data.organizer.eventsHosted,
        initials: data.organizer.initials,
        socialLinks: {
          email: data.organizer.socialLinks.email || undefined,
          facebook: data.organizer.socialLinks.facebook || undefined,
          instagram: data.organizer.socialLinks.instagram || undefined,
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
      },
    };
  };

  useEffect(() => {
    const fetchActivityDetail = async () => {
      if (!uuid) return;

      try {
        setLoading(true);
        setError(null);
        const URL = process.env.NEXTAUTH_BACKEND_URL;
        const response = await axios.get(`${URL}/api/visitor/activity-detail/${uuid}`);

        if (response.data && response.data.data) {
          const mappedData = mapActivityDetailData(response.data.data);
          setActivityData(mappedData);
        }
      } catch (err) {
        console.error('Error fetching activity detail:', err);
        setError("Failed to load activity details");
      } finally {
        setLoading(false);
      }
    };

    fetchActivityDetail();
  }, [uuid]);

  return {
    activityData,
    loading,
    error,
  };
};
