import type { AnalysisResult, Product } from '../types';

export interface SearchResponse {
  analysis: AnalysisResult;
  products: Product[];
}

export const searchByImage = async (imageBase64: string): Promise<SearchResponse> => {
  const response = await fetch('/api/search', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ imageBase64 })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message = error?.error || 'Search failed';
    throw new Error(message);
  }

  return response.json() as Promise<SearchResponse>;
};
