export interface Activity {
  id: string;
  uuid: string;
  title: string;
  categories: string[];
  location: string;
  lat: string;
  lon: string;
  startMonth: string;
  endMonth: string;
  email: string;
  phone: string;
  url: string;
  notes: string;
  description: string;
  images: File[];
  videos?: File[];
  mediaUrls?: {
    name: string;
    type: string;
  }[];
  originalActivityId?: string;
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