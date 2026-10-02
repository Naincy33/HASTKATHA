const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";


// ============================================================
// AUTH TYPES
// ============================================================

export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
};


// ============================================================
// AI LISTING TYPES
// ============================================================

export type AIListing = {
  product_name: string;
  description: string;
  material: string;
  product_type: string;
  craft_name: string;
  region: string;
  state: string;
  ocr_text: string;
  tags: string[];
  visual_features: string[];
  confidence: "high" | "medium" | "low" | string;
};


// ============================================================
// GENERIC API FETCH
// ============================================================

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {

  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("hastkatha_token")
      : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] =
      `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers,
    }
  );

  if (!response.ok) {

    let message =
      `API error: ${response.status}`;

    try {

      const errorData =
        await response.json();

      message =
        errorData.detail ||
        errorData.message ||
        message;

    } catch {
      // ignore JSON parsing error
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


export type CraftDetails = {
  craft: Craft;
  products: CraftProduct[];
};


// ============================================================
// PRODUCT TYPES
// ============================================================

export type ProductImage = {
  id: number;
  product_id: number;
  image_url: string;
  is_primary: boolean;
};


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
// RAG / AI TYPES
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
// PRICE ESTIMATOR TYPES
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
// IMAGE UPLOAD TYPES
// ============================================================

export type ProductImageUploadResult = {
  success: boolean;
  filename: string;
  image_url: string;
  message: string;
};


// ============================================================
// API
// ============================================================

export const api = {

  // ==========================================================
  // AUTH
  // ==========================================================

  login: async (
    email: string,
    password: string
  ): Promise<LoginResponse> => {

    const response =
      await apiFetch<LoginResponse>(
        "/auth/login",
        {
          method: "POST",

          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

    // Save JWT
    if (
      typeof window !== "undefined" &&
      response.access_token
    ) {
      localStorage.setItem(
        "hastkatha_token",
        response.access_token
      );
    }

    return response;
  },


  getMe: () =>
    apiFetch<User>("/auth/me"),


  getCurrentUser: () =>
    apiFetch<User>("/auth/me"),


  logout: () => {

    if (
      typeof window !== "undefined"
    ) {
      localStorage.removeItem(
        "hastkatha_token"
      );
    }
  },


  // ==========================================================
  // CRAFTS
  // ==========================================================

  getCrafts: (params?: {
    state?: string;
    gi_status?: string;
    search?: string;
    skip?: number;
    limit?: number;
  }) => {

    const searchParams =
      new URLSearchParams();

    if (params?.state) {
      searchParams.set(
        "state",
        params.state
      );
    }

    if (params?.gi_status) {
      searchParams.set(
        "gi_status",
        params.gi_status
      );
    }

    if (params?.search) {
      searchParams.set(
        "search",
        params.search
      );
    }

    searchParams.set(
      "skip",
      String(params?.skip ?? 0)
    );

    searchParams.set(
      "limit",
      String(params?.limit ?? 50)
    );

    return apiFetch<Craft[]>(
      `/crafts/?${searchParams.toString()}`
    );
  },


  getCraft: (craftId: number) =>
    apiFetch<Craft>(
      `/crafts/${craftId}`
    ),


  getCraftDetails: (craftId: number) =>
    apiFetch<CraftDetails>(
      `/crafts/${craftId}/details`
    ),


  // ==========================================================
  // PRODUCTS
  // ==========================================================

  getProducts: (params?: {
    search?: string;
    craft_id?: number;
    skip?: number;
    limit?: number;
  }) => {

    const searchParams =
      new URLSearchParams();

    if (params?.search) {
      searchParams.set(
        "search",
        params.search
      );
    }

    if (params?.craft_id) {
      searchParams.set(
        "craft_id",
        String(params.craft_id)
      );
    }

    searchParams.set(
      "skip",
      String(params?.skip ?? 0)
    );

    searchParams.set(
      "limit",
      String(params?.limit ?? 50)
    );

    return apiFetch<Product[]>(
      `/products/?${searchParams.toString()}`
    );
  },


  getProduct: (productId: number) =>
    apiFetch<Product>(
      `/products/${productId}`
    ),


  getMyProducts: () =>
    apiFetch<Product[]>(
      "/products/my"
    ),


  createProduct: (
    data: {
      craft_id: number;
      name: string;
      description?: string;
      price: number;
      stock: number;
      material?: string;
      dimensions?: string;
      production_time_days?: number;
    }
  ) =>
    apiFetch<Product>(
      "/products/",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ),


  // ==========================================================
  // PRODUCT IMAGES
  // ==========================================================

  getProductImages: (
    productId: number
  ) =>
    apiFetch<ProductImage[]>(
      `/product-image/product/${productId}`
    ),


  createProductImage: (data: {
    product_id: number;
    image_url: string;
    is_primary?: boolean;
  }) =>
    apiFetch<ProductImage>(
      "/product-image/",
      {
        method: "POST",

        body: JSON.stringify({
          product_id: data.product_id,
          image_url: data.image_url,
          is_primary:
            data.is_primary ?? true,
        }),
      }
    ),


  // ==========================================================
  // IMAGE UPLOAD
  // ==========================================================

  uploadProductImage: async (
    file: File
  ): Promise<ProductImageUploadResult> => {

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(
            "hastkatha_token"
          )
        : null;

    const headers: HeadersInit = {};

    if (token) {
      (
        headers as Record<string, string>
      )["Authorization"] =
        `Bearer ${token}`;
    }

    const response =
      await fetch(
        `${API_URL}/upload/product-image`,
        {
          method: "POST",
          headers,
          body: formData,
        }
      );

    if (!response.ok) {

      let message =
        `Upload failed: ${response.status}`;

      try {

        const errorData =
          await response.json();

        message =
          errorData.detail ||
          errorData.message ||
          message;

      } catch {
        // ignore
      }

      throw new Error(message);
    }

    return response.json();
  },


  // ==========================================================
  // AI PRODUCT LISTING
  // ==========================================================

  generateProductListing: async (
    file: File
  ): Promise<{
    success: boolean;
    data: AIListing;
  }> => {

    const formData =
      new FormData();

    formData.append(
      "file",
      file
    );

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(
            "hastkatha_token"
          )
        : null;

    const headers: HeadersInit = {};

    if (token) {
      (
        headers as Record<string, string>
      )["Authorization"] =
        `Bearer ${token}`;
    }

    const response =
      await fetch(
        `${API_URL}/api/ai/generate-listing`,
        {
          method: "POST",
          headers,
          body: formData,
        }
      );

    if (!response.ok) {

      let message =
        `AI generation failed: ${response.status}`;

      try {

        const errorData =
          await response.json();

        message =
          errorData.detail ||
          errorData.message ||
          message;

      } catch {
        // ignore
      }

      throw new Error(message);
    }

    return response.json();
  },


  // ==========================================================
  // RAG AI ASSISTANT
  // ==========================================================

  askAI: (
    question: string,
    topK: number = 5
  ) =>
    apiFetch<AIResult>(
      "/api/rag/ask",
      {
        method: "POST",

        body: JSON.stringify({
          question,
          top_k: topK,
        }),
      }
    ),


  // ==========================================================
  // PRICE ESTIMATOR
  // ==========================================================

  estimatePrice: (
    data: PriceEstimateRequest
  ) =>
    apiFetch<PriceEstimateResult>(
      "/api/ml/price-estimate",
      {
        method: "POST",

        body: JSON.stringify(data),
      }
    ),
};


// ============================================================
// EXPORT API URL
// ============================================================

export {
  API_URL,
};