import { useState, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router";
import {
  useProducts,
  useCategories,
  useAllProducts,
  type ListParams,
  PAGE_SIZE,
} from "../hooks/useProducts";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Star,
  Package,
  Plus,
  RotateCcw,
  TrendingUp,
  X,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { cn } from "../components/ui/utils";

const SORT_OPTIONS = [
  { value: "created_desc", label: "Newest first", sortBy: "createdAt", order: "desc" as const },
  { value: "created_asc", label: "Oldest first", sortBy: "createdAt", order: "asc" as const },
  { value: "id_desc", label: "Highest ID first", sortBy: "id", order: "desc" as const },
  { value: "price_asc", label: "Price: Low → High", sortBy: "price", order: "asc" as const },
  { value: "price_desc", label: "Price: High → Low", sortBy: "price", order: "desc" as const },
  { value: "rating_desc", label: "Highest rated", sortBy: "rating", order: "desc" as const },
  { value: "title_asc", label: "Name A → Z", sortBy: "title", order: "asc" as const },
];

const CHART_COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444",
  "#06b6d4", "#84cc16", "#f97316", "#ec4899", "#6366f1",
];

function StockBadge({ stock, status }: { stock: number; status?: string | undefined }) {
  const s = status || (stock === 0 ? "Out of Stock" : stock < 10 ? "Low Stock" : "In Stock");
  return (
    <span
      className={cn(
        "inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wide border",
        s === "In Stock" && "bg-emerald-50 text-emerald-700 border-emerald-200",
        s === "Low Stock" && "bg-amber-50 text-amber-700 border-amber-200",
        s === "Out of Stock" && "bg-red-50 text-red-700 border-red-200",
        !["In Stock", "Low Stock", "Out of Stock"].includes(s) && "bg-blue-50 text-blue-700 border-blue-200"
      )}
    >
      {s}
    </span>
  );
}

function RatingStars({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-1">
      <Star size={11} className="text-amber-400 fill-amber-400" />
      <span className="font-mono text-xs text-foreground">{value.toFixed(1)}</span>
    </span>
  );
}

function SkeletonRow() {
  return (
    <tr className="border-b border-border">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-muted rounded animate-pulse" style={{ width: `${40 + (i * 17) % 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

export default function ProductsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get("q") || "";
  const category = searchParams.get("cat") || "";
  const brand = searchParams.get("brand") || "";
  const sortValue = searchParams.get("sort") || "created_desc";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const [showChart, setShowChart] = useState(false);
  const [searchInput, setSearchInput] = useState(search);

  const sortOpt = SORT_OPTIONS.find((o) => o.value === sortValue) || SORT_OPTIONS[0]!;

  const params: ListParams = {
    page,
    search,
    category,
    brand,
    sortBy: sortOpt.sortBy,
    order: sortOpt.order,
  };

  const { data, isLoading, isError, isFetching, refetch } = useProducts(params);
  const { data: categories } = useCategories();
  const { data: allData } = useAllProducts();

  const brands = useMemo(() => {
    if (!allData?.products) return [];
    const bs = new Set<string>();
    allData.products.forEach(p => {
      if (p.brand) bs.add(p.brand);
    });
    return Array.from(bs).sort();
  }, [allData]);

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  const setParam = useCallback(
    (key: string, value: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
        if (key !== "page") next.delete("page");
        return next;
      });
    },
    [setSearchParams]
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParam("q", searchInput);
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearchParams({});
  };

  const hasFilters = search || category || brand || sortValue !== "created_desc";

  const chartData = useMemo(() => {
    if (!allData?.products) return [];
    const counts: Record<string, number> = {};
    allData.products.forEach((p) => {
      const b = p.brand || "Unknown";
      counts[b] = (counts[b] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);
  }, [allData]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Products</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {data ? (
              <>
                {data.total.toLocaleString()} total{" "}
                {isFetching && !isLoading && (
                  <span className="text-[#3b82f6]">· refreshing…</span>
                )}
              </>
            ) : (
              "Loading…"
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowChart((s) => !s)}
            className={cn(
              "flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-medium border transition-colors",
              showChart
                ? "bg-[#3b82f6] text-white border-[#3b82f6]"
                : "border-border text-muted-foreground hover:text-foreground hover:border-foreground/30"
            )}
            aria-pressed={showChart}
          >
            <TrendingUp size={13} />
            Analytics
          </button>
          <button
            onClick={() => navigate("/products/new")}
            className="flex items-center gap-1.5 px-3 h-8 rounded-lg text-xs font-semibold bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            <Plus size={13} />
            Add product
          </button>
        </div>
      </div>

      {/* Analytics chart */}
      {showChart && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Trend by Brand</h2>
            <span className="text-xs text-muted-foreground">All {allData?.total ?? "–"} products</span>
          </div>
          {allData ? (
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e6f0" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "#6b7280", fontFamily: "Inter, sans-serif" }}
                    tickLine={false}
                    axisLine={false}
                    interval={0}
                    angle={-35}
                    textAnchor="end"
                    height={55}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "#6b7280", fontFamily: "JetBrains Mono, monospace" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#fff",
                      border: "1px solid #e2e6f0",
                      borderRadius: 8,
                      fontSize: 12,
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                    cursor={{ fill: "#f0f2f7" }}
                  />
                  <Bar dataKey="count" radius={[3, 3, 0, 0]}>
                    {chartData.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-52 flex items-center justify-center text-sm text-muted-foreground">
              Loading chart data…
            </div>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-xs" role="search">
          <label htmlFor="product-search" className="sr-only">
            Search products
          </label>
          <Search
            size={13}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            id="product-search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-8 pr-3 h-8 text-sm border border-border rounded-lg bg-card placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-colors"
          />
          {searchInput && (
            <button
              type="button"
              onClick={() => { setSearchInput(""); setParam("q", ""); }}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </form>

        <label htmlFor="category-filter" className="sr-only">Filter by category</label>
        <select
          id="category-filter"
          value={category}
          onChange={(e) => setParam("cat", e.target.value)}
          className="h-8 px-3 text-xs border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-colors cursor-pointer"
        >
          <option value="">All categories</option>
          {categories?.map((cat) => (
            <option key={cat.slug} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>

        <label htmlFor="brand-filter" className="sr-only">Filter by brand</label>
        <select
          id="brand-filter"
          value={brand}
          onChange={(e) => setParam("brand", e.target.value)}
          className="h-8 px-3 text-xs border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-colors cursor-pointer"
        >
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <label htmlFor="sort-select" className="sr-only">Sort products</label>
        <select
          id="sort-select"
          value={sortValue}
          onChange={(e) => setParam("sort", e.target.value)}
          className="h-8 px-3 text-xs border border-border rounded-lg bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-colors cursor-pointer"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 h-8 text-xs text-muted-foreground hover:text-foreground border border-border rounded-lg hover:border-foreground/30 transition-colors"
          >
            <X size={11} />
            Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {isError ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="size-12 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
              <Package size={20} className="text-red-400" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Failed to load products</p>
              <p className="text-xs text-muted-foreground mt-1">Check your connection and try again</p>
            </div>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 px-4 h-8 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <RotateCcw size={12} />
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="overflow-x-auto hidden sm:block">
              <table className="w-full text-sm" aria-label="Products table">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-12">
                      #
                    </th>
                    <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Product
                    </th>
                    <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">
                      Brand
                    </th>
                    <th scope="col" className="px-4 py-2.5 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Price
                    </th>
                    <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                      Rating
                    </th>
                    <th scope="col" className="px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Stock
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading
                    ? Array.from({ length: PAGE_SIZE }).map((_, i) => <SkeletonRow key={i} />)
                    : data?.products.length === 0
                    ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-20 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="size-10 rounded-full bg-muted flex items-center justify-center">
                              <Package size={18} className="text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-foreground">No products found</p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                Try adjusting your search or filters
                              </p>
                            </div>
                            {hasFilters && (
                              <button
                                onClick={clearFilters}
                                className="text-xs text-[#3b82f6] hover:underline"
                              >
                                Clear all filters
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                    : data?.products.map((product) => (
                      <tr
                        key={product.id}
                        onClick={() => navigate(`/products/${product.id}`)}
                        onKeyDown={(e) => e.key === "Enter" && navigate(`/products/${product.id}`)}
                        tabIndex={0}
                        role="button"
                        aria-label={`View ${product.title}`}
                        className="border-b border-border last:border-0 hover:bg-accent/60 cursor-pointer transition-colors focus-visible:outline-none focus-visible:bg-accent/60 group"
                      >
                        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                          {product.id}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="size-9 rounded-lg overflow-hidden border border-border bg-muted shrink-0">
                              <img
                                src={product.thumbnail}
                                alt={product.title}
                                className="size-full object-cover"
                                loading="lazy"
                              />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-sm text-foreground truncate max-w-[200px] group-hover:text-[#3b82f6] transition-colors">
                                {product.title}
                              </p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {product.category}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                          {product.brand ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="font-mono text-sm font-medium text-foreground">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.discountPercentage > 0 && (
                            <span className="block text-[10px] text-emerald-600 font-medium">
                              -{product.discountPercentage.toFixed(0)}% off
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <RatingStars value={product.rating} />
                        </td>
                        <td className="px-4 py-3">
                          <StockBadge stock={product.stock} status={product.availabilityStatus} />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="sm:hidden divide-y divide-border">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 flex gap-3">
                    <div className="size-12 rounded-lg bg-muted animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
                      <div className="h-3 bg-muted rounded animate-pulse w-1/3" />
                    </div>
                  </div>
                ))
                : data?.products.length === 0
                ? (
                  <div className="py-20 text-center">
                    <p className="text-sm text-muted-foreground">No products found</p>
                    {hasFilters && (
                      <button onClick={clearFilters} className="mt-2 text-xs text-[#3b82f6]">
                        Clear filters
                      </button>
                    )}
                  </div>
                )
                : data?.products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => navigate(`/products/${product.id}`)}
                    className="w-full flex items-center gap-3 p-4 hover:bg-accent/60 text-left transition-colors"
                  >
                    <div className="size-12 rounded-lg overflow-hidden border border-border bg-muted shrink-0">
                      <img
                        src={product.thumbnail}
                        alt={product.title}
                        className="size-full object-cover"
                        loading="lazy"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-foreground truncate">{product.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{product.category}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs font-medium">${product.price.toFixed(2)}</span>
                        <RatingStars value={product.rating} />
                      </div>
                    </div>
                    <StockBadge stock={product.stock} status={product.availabilityStatus} />
                  </button>
                ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <nav
          className="flex items-center justify-between"
          aria-label="Pagination"
        >
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages} &middot;{" "}
            {data?.total.toLocaleString()} products
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setParam("page", String(page - 1))}
              disabled={page <= 1}
              aria-label="Previous page"
              className="size-8 flex items-center justify-center rounded-lg border border-border text-sm hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) {
                pageNum = i + 1;
              } else if (page <= 4) {
                pageNum = i + 1;
              } else if (page >= totalPages - 3) {
                pageNum = totalPages - 6 + i;
              } else {
                pageNum = page - 3 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => setParam("page", String(pageNum))}
                  aria-label={`Page ${pageNum}`}
                  aria-current={pageNum === page ? "page" : undefined}
                  className={cn(
                    "size-8 flex items-center justify-center rounded-lg text-xs font-medium transition-colors",
                    pageNum === page
                      ? "bg-primary text-white"
                      : "border border-border hover:bg-muted text-foreground"
                  )}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setParam("page", String(page + 1))}
              disabled={page >= totalPages}
              aria-label="Next page"
              className="size-8 flex items-center justify-center rounded-lg border border-border text-sm hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}
