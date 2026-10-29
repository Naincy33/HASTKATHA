"use client";

import type { Product } from "@/lib/api";

export type CartItem = { product: Product; quantity: number };
const CART_KEY = "hastkatha_cart";

export function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) as CartItem[] : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item?.product && Number.isFinite(item.product.id) && Number.isFinite(item.quantity) && item.quantity > 0);
  } catch {
    return [];
  }
}

export function writeCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent("hastkatha:cart-updated"));
}

export function addToCart(product: Product, quantity = 1): CartItem[] {
  const items = readCart();
  const existing = items.find((item) => item.product.id === product.id);
  if (existing) {
    existing.quantity = Math.min(product.stock, existing.quantity + quantity);
    existing.product = product;
  } else {
    items.push({ product, quantity: Math.min(product.stock, quantity) });
  }
  writeCart(items);
  return items;
}

export function cartCount(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

export function cartTotal(items: CartItem[]) {
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}
