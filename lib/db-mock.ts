// Mock Database to simulate Supabase/Postgres interactions
// Strictly aligned with provided Schema

export interface DbUser {
  id: string; // uuid
  email: string;
  name: string;
  created_at?: string;
}

export interface DbSearch {
  id: string; // uuid
  user_id?: string; // uuid
  image_url: string;
  detected_category: string;
  detected_style: string;
  detected_tags: Record<string, any>; // jsonb (mapped to object in TS)
  created_at: string;
}

export interface DbSearchResult {
  id: string; // uuid
  search_id: string; // uuid
  product_id: string; // uuid
  similarity_score: number;
  rank_position: number;
}

export interface DbProduct {
  id: string; // uuid
  title: string;
  brand: string;
  category: string;
  style_tag: string;
  image_url: string;
  product_url: string;
  source_platform: string;
  attributes: Record<string, any>; // jsonb
  created_at: string;
}

export interface DbProductPrice {
  id: string; // uuid
  product_id: string; // uuid
  price: number;
  currency: string;
  country: string;
  checked_at: string;
}

export interface DbSavedItem {
  id: string; // uuid
  user_id: string; // uuid
  product_id: string; // uuid
  saved_at: string;
}

// In-memory storage for simulation
const MOCK_STORE = {
  users: [] as DbUser[],
  searches: [] as DbSearch[],
  searchResults: [] as DbSearchResult[],
  savedItems: [] as DbSavedItem[],
  products: [] as DbProduct[],
  productPrices: [] as DbProductPrice[]
};

// Seed initial data
const seed = () => {
  const p1_id = "prod_1";
  const p2_id = "prod_2";
  
  MOCK_STORE.products.push(
    { id: p1_id, title: "Strandmon Wing Chair", brand: "IKEA", category: "Chair", style_tag: "Traditional", image_url: "https://picsum.photos/400/500?random=1", product_url: "#", source_platform: "IKEA", attributes: {}, created_at: new Date().toISOString() },
    { id: p2_id, title: "Eames Lounge Chair", brand: "Herman Miller", category: "Chair", style_tag: "Mid-Century Modern", image_url: "https://picsum.photos/400/400?random=2", product_url: "#", source_platform: "Herman Miller", attributes: {}, created_at: new Date().toISOString() }
  );
  
  MOCK_STORE.productPrices.push(
    { id: "price_1", product_id: p1_id, price: 299, currency: "USD", country: "US", checked_at: new Date().toISOString() },
    { id: "price_2", product_id: p2_id, price: 6500, currency: "USD", country: "US", checked_at: new Date().toISOString() }
  );
};
seed();

export const db = {
  users: {
    createOrUpdate: async (data: Partial<DbUser>) => {
      let user = MOCK_STORE.users.find(u => u.email === data.email);
      if (!user) {
        user = { 
          id: data.id || crypto.randomUUID(), 
          email: data.email || "", 
          name: data.name || "Anonymous",
          created_at: new Date().toISOString()
        };
        MOCK_STORE.users.push(user);
      }
      return user;
    },
    selectById: async (id: string) => MOCK_STORE.users.find(u => u.id === id)
  },
  searches: {
    insert: async (data: Partial<DbSearch>) => {
      const entry = { ...data, id: crypto.randomUUID(), created_at: new Date().toISOString() } as DbSearch;
      MOCK_STORE.searches.push(entry);
      return entry;
    },
    selectById: async (id: string) => MOCK_STORE.searches.find(s => s.id === id)
  },
  searchResults: {
    insert: async (data: Partial<DbSearchResult>[]) => {
      const entries = data.map(d => ({ ...d, id: crypto.randomUUID() } as DbSearchResult));
      MOCK_STORE.searchResults.push(...entries);
      return entries;
    },
    selectBySearchId: async (searchId: string) => MOCK_STORE.searchResults.filter(r => r.search_id === searchId)
  },
  savedItems: {
    insert: async (data: { user_id: string, product_id: string }) => {
      const entry = { ...data, id: crypto.randomUUID(), saved_at: new Date().toISOString() } as DbSavedItem;
      MOCK_STORE.savedItems.push(entry);
      return entry;
    },
    select: async (userId: string) => {
      return MOCK_STORE.savedItems.filter(item => item.user_id === userId);
    }
  },
  products: {
    // Helper to get product with latest price
    listWithPrice: async () => {
      return MOCK_STORE.products.map(p => {
        const price = MOCK_STORE.productPrices.find(pr => pr.product_id === p.id);
        return { ...p, price: price?.price, currency: price?.currency };
      });
    },
    selectByIdWithPrice: async (id: string) => {
      const p = MOCK_STORE.products.find(prod => prod.id === id);
      if (!p) return null;
      const price = MOCK_STORE.productPrices.find(pr => pr.product_id === p.id);
      return { ...p, price: price?.price, currency: price?.currency };
    },
    upsert: async (data: Partial<DbProduct> & { price?: number, currency?: string }) => {
      let product = MOCK_STORE.products.find(p => p.id === data.id);
      
      // Update or Insert Product
      if (product) {
        Object.assign(product, { ...data, attributes: data.attributes || {} });
      } else {
        product = {
          id: data.id || crypto.randomUUID(),
          title: data.title || "Unknown",
          brand: data.brand || "Generic",
          category: data.category || "Uncategorized",
          style_tag: data.style_tag || "Modern",
          image_url: data.image_url || "",
          product_url: data.product_url || "",
          source_platform: data.source_platform || "",
          attributes: data.attributes || {},
          created_at: new Date().toISOString()
        };
        MOCK_STORE.products.push(product);
      }

      // Update or Insert Price
      if (data.price !== undefined) {
        let priceEntry = MOCK_STORE.productPrices.find(pr => pr.product_id === product!.id);
        if (priceEntry) {
          priceEntry.price = data.price;
          priceEntry.checked_at = new Date().toISOString();
        } else {
          MOCK_STORE.productPrices.push({
            id: crypto.randomUUID(),
            product_id: product.id,
            price: data.price,
            currency: data.currency || "USD",
            country: "US",
            checked_at: new Date().toISOString()
          });
        }
      }
      return product;
    }
  }
};