export interface Activity {
  id: string;
  title: string;
  category: string;
  location: string;
  startMonth: string;
  endMonth: string;
  email: string;
  phone: string;
  url: string;
  notes: string;
  description: string;
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