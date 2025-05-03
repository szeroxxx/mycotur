export interface Event {
  id: string;
  activityName: string;
  event: string;
  eventDate: string;
  eventTime: string;
  category: string;
  location: string;
  description: string;
  email: string;
  phone: string;
  fees: string;
  images: File[];
}

export interface Toast {
  type: 'success' | 'error';
  message: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
}