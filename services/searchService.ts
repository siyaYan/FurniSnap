import type { AnalysisResult, Product } from '../types';

export interface SearchResponse {
  analysis: AnalysisResult;
  products: Product[];
}

export const searchByImage = async (imageBase64: string): Promise<SearchResponse> => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  let response: Response;
  try {
    response = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageBase64 }),
      signal: controller.signal
    });
  } catch (err) {
    if ((err as Error).name === 'AbortError') {
      throw new Error('The search took too long. Please try again.');
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    const message = error?.error || 'Search failed';
    throw new Error(message);
  }

  return response.json() as Promise<SearchResponse>;
};
