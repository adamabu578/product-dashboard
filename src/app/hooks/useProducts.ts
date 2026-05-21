import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockProductsData } from "../data/mockProducts";

const BASE = "https://dummyjson.com";
export const PAGE_SIZE = 10;

export interface Review {
  rating: number;
  comment: string;
  date: string;
  reviewerName: string;
  reviewerEmail: string;
}

export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage: number;
  rating: number;
  stock: number;
  brand?: string;
  category: string;
  thumbnail: string;
  images: string[];
  tags?: string[];
  sku?: string;
  weight?: number;
  warrantyInformation?: string;
  shippingInformation?: string;
  availabilityStatus?: string;
  returnPolicy?: string;
  minimumOrderQuantity?: number;
  reviews?: Review[];
  meta?: {
    createdAt: string;
    updatedAt: string;
    barcode?: string;
    qrCode?: string;
  };
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface Category {
  slug: string;
  name: string;
  url: string;
}

export interface ListParams {
  page: number;
  search: string;
  category: string;
  brand: string;
  sortBy: string;
  order: "asc" | "desc";
}

function buildUrl(params: ListParams): string {
  const skip = (params.page - 1) * PAGE_SIZE;
  let sortPart = `&sortBy=${params.sortBy}&order=${params.order}`;
  if (params.brand) sortPart += `&brand=${encodeURIComponent(params.brand)}`;

  if (params.search.trim()) {
    return `${BASE}/products/search?q=${encodeURIComponent(params.search.trim())}&limit=${PAGE_SIZE}&skip=${skip}${sortPart}`;
  }
  if (params.category) {
    return `${BASE}/products/category/${encodeURIComponent(params.category)}?limit=${PAGE_SIZE}&skip=${skip}${sortPart}`;
  }
  return `${BASE}/products?limit=${PAGE_SIZE}&skip=${skip}${sortPart}`;
}

async function fetchJson<T>(url: string): Promise<T> {
  if (url.includes(`${BASE}/products`)) {
    if (!url.includes("/categories") && !url.includes("/add")) {
      const match = url.match(/\/products\/(\d+)(?:\?|$)/);
      if (match) {
        const id = parseInt(match[1]);
        const product = mockProductsData.products.find((p: any) => p.id === id);
        if (product) return product as unknown as T;
        throw new Error("Product not found in mock data");
      }
      
      // Parse query params to apply local sorting, filtering, and pagination
      const urlObj = new URL(url);
      const search = urlObj.searchParams.get("q") || "";
      const sortBy = urlObj.searchParams.get("sortBy") || "id";
      const order = urlObj.searchParams.get("order") || "desc";
      const skip = parseInt(urlObj.searchParams.get("skip") || "0", 10);
      const limit = parseInt(urlObj.searchParams.get("limit") || PAGE_SIZE.toString(), 10);
      
      let filtered = [...mockProductsData.products];
      
      // Local category filter (parsed from URL path)
      const catMatch = url.match(/\/products\/category\/([^?]+)/);
      if (catMatch) {
        const cat = decodeURIComponent(catMatch[1]);
        filtered = filtered.filter((p: any) => p.category === cat);
      }
      
      // Local brand filter (passed as custom query param in buildUrl)
      const brand = urlObj.searchParams.get("brand");
      if (brand) {
        filtered = filtered.filter((p: any) => p.brand === brand);
      }
      
      // Local search
      if (search) {
        const lower = search.toLowerCase();
        filtered = filtered.filter((p: any) => p.title.toLowerCase().includes(lower));
      }
      
      // Local sort
      filtered.sort((a: any, b: any) => {
        let valA = a[sortBy];
        let valB = b[sortBy];
        
        if (sortBy === 'createdAt') {
          valA = a.meta?.createdAt || "";
          valB = b.meta?.createdAt || "";
        }
        
        if (valA < valB) return order === "asc" ? -1 : 1;
        if (valA > valB) return order === "asc" ? 1 : -1;
        return 0;
      });
      
      // Local pagination
      const total = filtered.length;
      const paginated = filtered.slice(skip, skip + limit);
      
      return {
        products: paginated,
        total,
        skip,
        limit,
      } as unknown as T;
    }
  }

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
  return res.json();
}

export function useProducts(params: ListParams) {
  return useQuery<ProductsResponse>({
    queryKey: ["products", params],
    queryFn: () => fetchJson<ProductsResponse>(buildUrl(params)),
    staleTime: 5 * 60 * 1000,
    placeholderData: (prev) => prev,
    refetchOnWindowFocus: true,
  });
}

export function useProduct(id: number | null) {
  return useQuery<Product>({
    queryKey: ["product", id],
    queryFn: () => fetchJson<Product>(`${BASE}/products/${id}`),
    staleTime: 5 * 60 * 1000,
    enabled: id !== null && id > 0,
  });
}

export function useCategories() {
  return useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => fetchJson<Category[]>(`${BASE}/products/categories`),
    staleTime: 60 * 60 * 1000,
  });
}

export function useAllProducts() {
  return useQuery<ProductsResponse>({
    queryKey: ["products-all"],
    queryFn: () => fetchJson<ProductsResponse>(`${BASE}/products?limit=194&skip=0&select=id,title,category,brand,price,rating,stock`),
    staleTime: 10 * 60 * 1000,
  });
}

export function useAddProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Product>) =>
      fetch(`${BASE}/products/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => {
        if (!r.ok) throw new Error("Failed to add product");
        return r.json() as Promise<Product>;
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["products"] });
      qc.invalidateQueries({ queryKey: ["products-all"] });
    },
  });
}
