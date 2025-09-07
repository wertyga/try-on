import { SORT_BY, SORT_DIRECTION } from './sort';

export type SortRequest = {
  sortBy?: SORT_BY;
  sortDirection?: SORT_DIRECTION;
};

export type PaginationRequest = {
  offset?: number;
  limit?: number;
};

export type SortAndPaginationRequest = SortRequest & PaginationRequest & {};

export type TimestampType = {
  createdAt?: string;
  updatedAt?: string;
};

export type GetTagsRequest = {
  limit?: number;
};
export type GetTagsResponse = {
  tags: string[];
};

export type SuccessResponse = {
  success: boolean;
};
