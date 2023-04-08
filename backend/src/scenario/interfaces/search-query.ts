export enum SearchQueryOrder {
  Asc = 'asc',
  Desc = 'desc'
}

export enum SearchQuerySort {
  Title = 'title',
  Length = 'length'
}

export interface SearchQueryCursor {
  unique: string;
  sorted: string | number;
}

export interface SearchQuery {
  query?: string;
  sortBy: SearchQuerySort;
  orderBy: SearchQueryOrder;
  limit: number;
  cursorNext?: SearchQueryCursor;
  cursorPrev?: SearchQueryCursor;
}
