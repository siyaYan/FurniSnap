import 'server-only';

export interface RawProductCandidate {
  title: string;
  image: string;
  url: string;
  price: number;
  currency: string;
  brand: string;
  colors?: string[];
  materials?: string[];
}

interface SerpApiShoppingResult {
  title?: string;
  product_link?: string;
  thumbnail?: string;
  price?: string;
  extracted_price?: number;
  source?: string;
}

interface SerpApiResponse {
  shopping_results?: SerpApiShoppingResult[];
}

const buildQuery = (category: string, style: string) => {
  const safeCategory = category?.trim() || 'furniture';
  const safeStyle = style?.trim();
  return safeStyle ? `${safeStyle} ${safeCategory} furniture` : `${safeCategory} furniture`;
};

const parsePrice = (value?: number, priceText?: string) => {
  if (typeof value === 'number') return value;
  if (!priceText) return 0;
  const numeric = Number(priceText.replace(/[^0-9.]/g, ''));
  return Number.isFinite(numeric) ? numeric : 0;
};

export const fetchShoppingCandidates = async (category: string, style: string): Promise<RawProductCandidate[]> => {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    throw new Error('SERPAPI_API_KEY is missing from environment variables');
  }

  const params = new URLSearchParams({
    engine: 'google_shopping',
    q: buildQuery(category, style),
    hl: 'en',
    gl: 'us',
    api_key: apiKey
  });

  const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });

  if (!response.ok) {
    throw new Error(`SerpAPI request failed: ${response.status}`);
  }

  const data = (await response.json()) as SerpApiResponse & { inline_shopping_results?: SerpApiShoppingResult[], error?: string };
  if (data.error) console.error('[serpapi] API error:', data.error);
  console.log('[serpapi] shopping_results:', data.shopping_results?.length ?? 'missing', '| inline_shopping_results:', data.inline_shopping_results?.length ?? 'missing');
  const results = data.shopping_results ?? data.inline_shopping_results ?? [];
  if (results.length > 0) console.log('[serpapi] first result keys:', Object.keys(results[0]));

  return results
    .filter(item => item.product_link && item.product_link.startsWith('http'))
    .map((item) => {
      const price = parsePrice(item.extracted_price, item.price);
      return {
        title: item.title || 'Unknown Item',
        image: item.thumbnail || '',
        url: item.product_link as string,
        price,
        currency: 'USD',
        brand: item.source || 'Unknown'
      };
    });
};
