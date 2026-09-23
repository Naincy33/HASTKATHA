const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

// ============================================================
// GENERIC API FETCH
// ============================================================

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,

    headers: {
      "Content-Type": "application/json",
      ...(options?.headers || {}),
    },
  });

  if (!response.ok) {
    let message = `API error: ${response.status}`;

    try {
      const errorData = await response.json();

      message = errorData.detail || errorData.message || message;
    } catch {
      // Response was not JSON.
    }

    throw new Error(message);
  }

  return response.json();
}

// ============================================================
// CRAFT TYPES
// ============================================================

export type Craft = {
  id: number;

  name: string;

  description?: string;

  state?: string;

  region?: string;

  material?: string;

  technique?: string;

  gi_status?: string;
};

// ============================================================
// CRAFT PRODUCT TYPES
// ============================================================

export type CraftProduct = {
  id: number;

  name: string;

  description?: string;

  price: number;

  stock: number;

  material?: string;

  dimensions?: string;

  production_time_days?: number;

  artisan_id: number;

  craft_id: number;
};


// ============================================================
// CRAFT DETAIL RESPONSE
// ============================================================

export type CraftDetails = {
  craft: Craft;

  products: CraftProduct[];
};

// ============================================================
// PRODUCT IMAGE
// ============================================================

export type ProductImage = {
  id: number;
  product_id: number;
  image_url: string;
  is_primary: boolean;
};
// ============================================================
// PRODUCT TYPES
// ============================================================

export type Product = {
  id: number;
  artisan_id: number;
  craft_id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  material?: string;
  dimensions?: string;
  production_time_days?: number;
  is_active?: boolean;
};
// ============================================================
// AI / RAG TYPES
// ============================================================

export type AISource = {
  state?: string;

  district?: string;

  category?: string;

  gi_status?: string;

  distance?: number;

  craft_name?: string;

  product?: string;
};

export type AIResult = {
  success: boolean;

  answer: string;

  sources?: AISource[];
};

// ============================================================
// PRICE ML TYPES
// ============================================================

export type PriceEstimateRequest = {
  product_name: string;

  material: string;

  product_type: string;

  mrp: number;
};

export type ComparableProduct = {
  product_name: string;

  selling_price: number;

  material?: string;

  product_type?: string;

  source?: string;

  url?: string;
};

export type PriceEstimateResult = {
  success: boolean;

  data: {
    predicted_price: number;

    estimated_range?: {
      min: number;

      max: number;
    };

    price_range?: {
      min: number;

      max: number;
    };

    confidence: string;

    comparison_basis?: string;

    comparable_products_count?: number;

    comparable_products?: ComparableProduct[];
  };
};

// ============================================================
// API
// ============================================================

export const api = {
  // ==========================================================
  // CRAFT EXPLORER
  // ==========================================================

  getCrafts: (params?: {
    state?: string;

    gi_status?: string;

    search?: string;

    skip?: number;

    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();

    if (params?.state) {
      searchParams.set("state", params.state);
    }

    if (params?.gi_status) {
      searchParams.set("gi_status", params.gi_status);
    }

    if (params?.search) {
      searchParams.set("search", params.search);
    }

    searchParams.set("skip", String(params?.skip ?? 0));

    searchParams.set("limit", String(params?.limit ?? 50));

    return apiFetch<Craft[]>(`/crafts/?${searchParams.toString()}`);
  },

  // ==========================================================
  // SINGLE CRAFT
  // ==========================================================

  getCraft: (craftId: number) => apiFetch<Craft>(`/crafts/${craftId}`),

  // ==========================================================
  // CRAFT DETAIL + PRODUCTS
  // ==========================================================

  getCraftDetails: (craftId: number) =>
    apiFetch<CraftDetails>(`/crafts/${craftId}/details`),


  getMyProducts: () =>
  apiFetch<Product[]>(
    "/products/my"
  ),
  // ==========================================================
  // PRODUCT IMAGES
  // ==========================================================

  getProductImages: (productId: number) =>
    apiFetch<ProductImage[]>(`/product-image/product/${productId}`),
  // ==========================================================
  // PRODUCT MARKETPLACE
  // ==========================================================

  getProducts: (params?: {
    search?: string;
    craft_id?: number;
    skip?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();

    if (params?.search) {
      searchParams.set("search", params.search);
    }

    if (params?.craft_id) {
      searchParams.set("craft_id", String(params.craft_id));
    }

    searchParams.set("skip", String(params?.skip ?? 0));

    searchParams.set("limit", String(params?.limit ?? 50));

    return apiFetch<Product[]>(`/products/?${searchParams.toString()}`);
  },

  getProduct: (productId: number) =>
    apiFetch<Product>(`/products/${productId}`),

  // ==========================================================
  // AI / RAG
  // ==========================================================

  askAI: (
    question: string,

    topK: number = 5,
  ) =>
    apiFetch<AIResult>("/api/rag/ask", {
      method: "POST",

      body: JSON.stringify({
        question,

        top_k: topK,
      }),
    }),

  // ==========================================================
  // PRICE ML
  // ==========================================================

  estimatePrice: (data: PriceEstimateRequest) =>
    apiFetch<PriceEstimateResult>("/api/ml/price-estimate", {
      method: "POST",

      body: JSON.stringify(data),
    }),
};

// ============================================================
// EXPORT API URL
// ============================================================

export { API_URL };
