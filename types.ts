export enum LoadingState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING = 'ANALYZING',
  SEARCHING = 'SEARCHING',
  COMPLETE = 'COMPLETE',
  ERROR = 'ERROR'
}

export interface AnalysisResult {
  category: string;
  style: string;
  colors: string[];
  materials: string[];
  description: string;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  currency: string;
  brand: string;
  imageUrl: string;
  productUrl: string;
  similarityScore: number;
  tags: string[]; // e.g., 'Cheaper', 'Premium', 'Same Style'
  style: string;
  category: string;
  colors?: string[];
  materials?: string[];
}

export interface SearchFilters {
  minPrice: number;
  maxPrice: number;
  style: string | null;
  brand: string | null;
  category: string | null;
  colors: string[];
  materials: string[];
}
