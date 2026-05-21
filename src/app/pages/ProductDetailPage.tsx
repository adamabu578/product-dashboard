import { useParams, useNavigate, Link } from "react-router";
import { useProduct } from "../hooks/useProducts";
import {
  Star,
  Package,
  RotateCcw,
  Tag,
  Truck,
  Shield,
  AlertTriangle,
  ChevronRight,
  Calendar,
  ArrowLeft,
} from "lucide-react";
import { cn } from "../components/ui/utils";
import { format, parseISO } from "date-fns";
import { useState } from "react";

function StockBadge({ stock, status }: { stock: number; status?: string | undefined }) {
  const s = status || (stock === 0 ? "Out of Stock" : stock < 10 ? "Low Stock" : "In Stock");
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border",
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

function Field({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="space-y-0.5">
      <dt className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</dt>
      <dd className={cn("text-sm text-foreground", mono && "font-mono")}>{value}</dd>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const productId = id ? parseInt(id, 10) : null;
  const [activeImg, setActiveImg] = useState(0);

  const { data: product, isLoading, isError, refetch } = useProduct(productId);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-4 w-20 bg-muted rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="aspect-square bg-muted rounded-xl animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-5 bg-muted rounded animate-pulse" style={{ width: `${60 + (i * 13) % 35}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft size={15} />
          Back to products
        </button>
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="size-14 rounded-full bg-red-50 border border-red-200 flex items-center justify-center">
            <AlertTriangle size={22} className="text-red-400" />
          </div>
          <div className="text-center">
            <p className="font-medium text-foreground">Product not found</p>
            <p className="text-sm text-muted-foreground mt-1">
              This product may have been removed or the ID is invalid.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 px-4 h-8 text-xs font-medium border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <RotateCcw size={12} />
              Retry
            </button>
            <Link
              to="/products"
              className="flex items-center gap-1.5 px-4 h-8 text-xs font-medium bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Package size={12} />
              All products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const createdAt = product.meta?.createdAt
    ? format(parseISO(product.meta.createdAt), "MMM d, yyyy 'at' h:mm a")
    : "—";
  const updatedAt = product.meta?.updatedAt
    ? format(parseISO(product.meta.updatedAt), "MMM d, yyyy")
    : "—";
  const effectivePrice = product.price * (1 - product.discountPercentage / 100);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/products" className="hover:text-foreground transition-colors">
          Products
        </Link>
        <ChevronRight size={11} />
        <span className="text-foreground font-medium truncate max-w-[200px]">{product.title}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        {/* Image gallery */}
        <div className="space-y-3">
          <div className="aspect-square rounded-xl overflow-hidden border border-border bg-muted">
            <img
              src={product.images?.[activeImg] ?? product.thumbnail}
              alt={`${product.title} — image ${activeImg + 1}`}
              className="size-full object-cover"
            />
          </div>
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 flex-wrap" role="list" aria-label="Product images">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  role="listitem"
                  onClick={() => setActiveImg(i)}
                  aria-label={`View image ${i + 1}`}
                  aria-pressed={i === activeImg}
                  className={cn(
                    "size-14 rounded-lg overflow-hidden border-2 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/50",
                    i === activeImg ? "border-[#3b82f6]" : "border-transparent hover:border-border"
                  )}
                >
                  <img src={img} alt="" className="size-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Core info */}
        <div className="space-y-5">
          <div>
            <div className="flex items-start justify-between gap-3 mb-1">
              <h1 className="text-xl font-semibold text-foreground leading-snug">{product.title}</h1>
              <StockBadge stock={product.stock} status={product.availabilityStatus} />
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="capitalize">{product.category}</span>
              {product.brand && (
                <>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                  <span>{product.brand}</span>
                </>
              )}
              {product.sku && (
                <>
                  <span className="w-1 h-1 rounded-full bg-muted-foreground/50" />
                  <span className="font-mono">SKU: {product.sku}</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-end gap-3">
            <div>
              <p className="font-mono text-3xl font-bold text-foreground">
                ${effectivePrice.toFixed(2)}
              </p>
              {product.discountPercentage > 0 && (
                <p className="text-sm text-muted-foreground line-through mt-0.5">
                  ${product.price.toFixed(2)}
                </p>
              )}
            </div>
            {product.discountPercentage > 0 && (
              <span className="mb-0.5 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-semibold">
                -{product.discountPercentage.toFixed(0)}% off
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={cn(
                    i < Math.round(product.rating)
                      ? "text-amber-400 fill-amber-400"
                      : "text-muted-foreground/30"
                  )}
                />
              ))}
              <span className="font-mono text-sm ml-1">{product.rating.toFixed(1)}</span>
            </div>
            {product.reviews && (
              <span className="text-xs text-muted-foreground">
                {product.reviews.length} review{product.reviews.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-4 pt-1">
            <Field label="Stock" value={<span className="font-mono">{product.stock.toLocaleString()} units</span>} />
            {product.minimumOrderQuantity && (
              <Field label="Min. Order" value={<span className="font-mono">{product.minimumOrderQuantity}</span>} />
            )}
            {product.weight && (
              <Field label="Weight" value={<span className="font-mono">{product.weight}g</span>} />
            )}
            <Field
              label="Created"
              value={
                <span className="flex items-center gap-1.5">
                  <Calendar size={11} className="text-muted-foreground" />
                  {createdAt}
                </span>
              }
            />
            <Field label="Last updated" value={updatedAt} />
          </dl>

          <div className="space-y-2 pt-1">
            {product.shippingInformation && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Truck size={13} className="text-[#3b82f6] shrink-0" />
                {product.shippingInformation}
              </div>
            )}
            {product.warrantyInformation && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Shield size={13} className="text-emerald-500 shrink-0" />
                {product.warrantyInformation}
              </div>
            )}
            {product.returnPolicy && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <RotateCcw size={13} className="text-amber-500 shrink-0" />
                {product.returnPolicy}
              </div>
            )}
          </div>

          {product.tags && product.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {product.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border border-border text-muted-foreground"
                >
                  <Tag size={9} />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      {product.reviews && product.reviews.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Customer Reviews
            <span className="ml-2 font-mono text-muted-foreground font-normal">({product.reviews.length})</span>
          </h2>
          <div className="space-y-4">
            {product.reviews.map((review, i) => (
              <div key={i} className="pb-4 border-b border-border last:border-0 last:pb-0">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div>
                    <p className="text-sm font-medium text-foreground">{review.reviewerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {review.date ? format(parseISO(review.date), "MMM d, yyyy") : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star
                        key={j}
                        size={11}
                        className={cn(
                          j < review.rating ? "text-amber-400 fill-amber-400" : "text-muted-foreground/30"
                        )}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{review.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
