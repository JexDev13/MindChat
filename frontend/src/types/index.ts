export * from "./auth";
export * from "./clinical";
export * from "./appointments";
export * from "./chat";

// Generic API Response
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  errors?: string[];
  message?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
}

// Error Response
export interface ErrorResponse {
  title: string;
  status: number;
  errors: Record<string, string[]>;
}
