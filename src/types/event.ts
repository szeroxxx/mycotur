export interface Event {
  id: string;
  activityName: string;
  activityId?: string | null;
  event: string;
  eventDate: string;
  eventTime: string;
  category: string;
  categories: string[];
  description: string;
  email: string;
  phone: string;
  url: string;
  fees: string;images: File[];
  videos: File[];
  mediaUrls?: {
    name: string;
    type: string;
  }[];
  user?: string;
  location?: string;
  lat?: number;
  lon?: number;
}

export interface Toast {
  type: "success" | "error";
  message: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}
