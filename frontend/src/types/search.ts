export type SearchResultType =
  | "product"
  | "doctor"
  | "hospital"
  | "mechanic"
  | "service";

export interface SearchResult {
  id: number | string;
  type: SearchResultType;
  title: string;
  description?: string;
  location?: string;
  rating?: number;
  image?: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
}