import { api } from "./api-client";

export interface Category {
  id: string;
  name: string;
  description: string;
  sort_order: number;
  article_count: number;
  faq_count: number;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  published: boolean;
  category: { id: string; name: string } | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: { id: string; name: string } | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// ─── Categories ─────────────────────────────────────────────

export async function fetchCategories(): Promise<Category[]> {
  return api.get("/api/knowledge/categories");
}

export async function createCategory(data: { name: string; description?: string }): Promise<Category> {
  return api.post("/api/knowledge/categories", data);
}

export async function updateCategory(id: string, data: { name?: string; description?: string }): Promise<Category> {
  return api.patch(`/api/knowledge/categories/${id}`, data);
}

export async function deleteCategory(id: string): Promise<void> {
  return api.delete(`/api/knowledge/categories/${id}`);
}

// ─── Articles ───────────────────────────────────────────────

export async function fetchArticles(params?: { category_id?: string; published?: boolean }): Promise<Article[]> {
  const searchParams = new URLSearchParams();
  if (params?.category_id) searchParams.set("category_id", params.category_id);
  if (params?.published !== undefined) searchParams.set("published", String(params.published));
  const qs = searchParams.toString();
  return api.get(`/api/knowledge/articles${qs ? `?${qs}` : ""}`);
}

export async function fetchArticle(id: string): Promise<Article> {
  return api.get(`/api/knowledge/articles/${id}`);
}

export async function createArticle(data: {
  title: string;
  content: string;
  excerpt?: string;
  category_id?: string | null;
}): Promise<Article> {
  return api.post("/api/knowledge/articles", data);
}

export async function updateArticle(id: string, data: {
  title?: string;
  content?: string;
  excerpt?: string;
  published?: boolean;
  category_id?: string | null;
}): Promise<Article> {
  return api.patch(`/api/knowledge/articles/${id}`, data);
}

export async function deleteArticle(id: string): Promise<void> {
  return api.delete(`/api/knowledge/articles/${id}`);
}

// ─── FAQs ───────────────────────────────────────────────────

export async function fetchFAQs(params?: { category_id?: string }): Promise<FAQ[]> {
  const searchParams = new URLSearchParams();
  if (params?.category_id) searchParams.set("category_id", params.category_id);
  const qs = searchParams.toString();
  return api.get(`/api/knowledge/faqs${qs ? `?${qs}` : ""}`);
}

export async function createFAQ(data: {
  question: string;
  answer: string;
  category_id?: string | null;
}): Promise<FAQ> {
  return api.post("/api/knowledge/faqs", data);
}

export async function updateFAQ(id: string, data: {
  question?: string;
  answer?: string;
  category_id?: string | null;
}): Promise<FAQ> {
  return api.patch(`/api/knowledge/faqs/${id}`, data);
}

export async function deleteFAQ(id: string): Promise<void> {
  return api.delete(`/api/knowledge/faqs/${id}`);
}
