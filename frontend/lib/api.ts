const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,

      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    }
  );

  if (!response.ok) {
    let message = `API error: ${response.status}`;

    try {
      const errorData =
        await response.json();

      message =
        errorData.detail ||
        errorData.message ||
        message;
    } catch {
      // Response was not JSON.
    }

    throw new Error(message);
  }

  return response.json();
}

/* =========================
   AI / RAG
========================= */

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

export const api = {
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

  /* =========================
     PRICE ML
  ========================= */

  estimatePrice: (data: {
    product_name: string;
    material: string;
    product_type: string;
    mrp: number;
  }) =>
    apiFetch<{
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

        comparable_products?: {
          product_name: string;
          selling_price: number;
          material?: string;
          product_type?: string;
          source?: string;
          url?: string;
        }[];
      };
    }>(
      "/api/ml/price-estimate",
      {
        method: "POST",

        body: JSON.stringify(data),
      }
    ),
};

export { API_URL };