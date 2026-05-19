export type ApiSuccess<T> = { data: T };

export type ApiError = {
  error: {
    code: string;
    message: string;
    fields?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiError;

export type PaginatedResponse<T> = ApiSuccess<{
  items: T[];
  nextCursor: string | null;
  hasMore: boolean;
}>;
