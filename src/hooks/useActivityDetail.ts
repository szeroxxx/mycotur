import { useState, useEffect } from "react";
import axiosInstance from "../utils/axiosConfig";
import { getMediaUrl } from "../utils/mediaHelpers";

interface RawActivityDetailData {
  id: number;
  uuid: string;
  title: string;
  owner: string;
  category: string;
  categories?: string[];
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
  photos: { name: string; type: string }[];
  eventDates: {
    id: string;
    date: string;
    time: string;
  }[];
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
      youtube?: string;
    };
  };
}

export interface ActivityDetailData {
  id: string;
  title: string;  photos: {
    id: string;
    url: string;
    alt: string;
    type: string;
  }[];
  totalPhotos: number;
  category: string;
  categories: string[];
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
    avatar?: string;
    eventsHosted: number;
    initials: string;
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
    link: string;
  };
}

export const useActivityDetail = (uuid: string | undefined) => {
  const [activityData, setActivityData] = useState<ActivityDetailData | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapActivityDetailData = (
    data: RawActivityDetailData
  ): ActivityDetailData => {
    return {
      id: data.uuid,
      title: data.title,      photos: data.photos.map((media, index) => ({
        id: (index + 1).toString(),
        url: getMediaUrl(media.name),
        alt: `${data.title} - Media ${index + 1}`,
        type: media.type,
      })),
      totalPhotos: data.photos.length,
      category: data.category,
      categories: data.categories || (data.category ? [data.category] : []),
      eventDates: data.eventDates || [],
      seasons: {
        availableMonths: `${
          data.title
        } adventure can be organised in between ${new Date(
          data.startMonth
        ).toLocaleDateString("en-US", { month: "long" })} to ${new Date(
          data.endMonth
        ).toLocaleDateString("en-US", {
          month: "long",
        })} (best prefer time from organiser)`,
        unavailableMonths: undefined,
      },
      description: {
        main: data.description,
      },
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
        link: data.link,
      },
    };
  };

  useEffect(() => {
    const fetchActivityDetail = async () => {
      if (!uuid) return;      try {
        setLoading(true);
        setError(null);
        const URL = process.env.NEXTAUTH_BACKEND_URL;
        const response = await axiosInstance.get(
          `${URL}/api/visitor/activity-detail/${uuid}`
        );
        if (response.data && response.data.data) {
          const mappedData = mapActivityDetailData(response.data.data);
          setActivityData(mappedData);
        }
      } catch (err) {
        console.error("Error fetching activity detail:", err);
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
