export interface Agent {
  id: string;
  name: string;
  email: string;
  status: 'Active' | 'Invited';
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