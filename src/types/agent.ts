export interface Agent {
  id: string;
  name: string;
  email: string;
  status:  'invited' |'active' ;
  about?: string;
  address?: string;
  social?: {
    facebook?: string;
    instagram?: string;
    youtube?: string;
  };  categories?: string[];
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