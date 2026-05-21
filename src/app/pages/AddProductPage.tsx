import { Link } from "react-router";
import { useForm } from "react-hook-form";
import { useAddProduct, useCategories } from "../hooks/useProducts";
import { CheckCircle2, AlertCircle, Package, Loader2, ChevronRight } from "lucide-react";
import { cn } from "../components/ui/utils";

interface FormValues {
  title: string;
  description: string;
  price: number;
  stock: number;
  brand: string;
  category: string;
  discountPercentage: number;
}

function FieldWrapper({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string | undefined;
  hint?: string | undefined;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="block text-xs font-semibold text-foreground uppercase tracking-wider"
      >
        {label}
        {required && <span className="text-red-500 ml-0.5" aria-hidden>*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs text-destructive flex items-center gap-1">
          <AlertCircle size={11} />
          {error}
        </p>
      )}
    </div>
  );
}

const inputClass = (hasError?: boolean) =>
  cn(
    "w-full px-3 h-9 text-sm border rounded-lg bg-input-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 transition-colors",
    hasError
      ? "border-destructive focus:ring-destructive/20 focus:border-destructive"
      : "border-border focus:ring-[#3b82f6]/20 focus:border-[#3b82f6]"
  );

export default function AddProductPage() {
  const { data: categories } = useCategories();
  const addProduct = useAddProduct();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      title: "",
      description: "",
      price: undefined,
      stock: undefined,
      brand: "",
      category: "",
      discountPercentage: 0,
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const payload: any = {
        title: data.title,
        description: data.description,
        price: Number(data.price),
        stock: Number(data.stock),
        category: data.category,
        discountPercentage: Number(data.discountPercentage) || 0,
      };
      if (data.brand) payload.brand = data.brand;

      await addProduct.mutateAsync(payload);
    } catch {
      // error handled by mutation state
    }
  };

  if (addProduct.isSuccess) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-6">
        <div className="bg-card border border-border rounded-xl p-10 text-center space-y-4">
          <div className="size-14 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto">
            <CheckCircle2 size={26} className="text-emerald-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Product added</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {addProduct.data?.title ?? "New product"} has been created successfully.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
            <button
              onClick={() => { addProduct.reset(); reset(); }}
              className="flex items-center justify-center gap-1.5 px-4 h-9 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
            >
              Add another
            </button>
            <Link
              to="/products"
              className="flex items-center justify-center gap-1.5 px-4 h-9 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Package size={14} />
              View all products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-5">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link to="/products" className="hover:text-foreground transition-colors">Products</Link>
        <ChevronRight size={11} />
        <span className="text-foreground font-medium">Add product</span>
      </nav>

      <div>
        <h1 className="text-lg font-semibold text-foreground">Add new product</h1>
        <p className="text-xs text-muted-foreground mt-0.5">
          Fill in the details below. Fields marked <span className="text-red-500">*</span> are required.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-card border border-border rounded-xl p-6 space-y-5"
        noValidate
      >
        <FieldWrapper
          label="Title"
          htmlFor="title"
          required
          error={errors.title?.message}
        >
          <input
            id="title"
            type="text"
            autoFocus
            placeholder="e.g. iPhone 16 Pro"
            {...register("title", {
              required: "Title is required",
              minLength: { value: 3, message: "At least 3 characters" },
              maxLength: { value: 120, message: "Max 120 characters" },
            })}
            className={inputClass(!!errors.title)}
            aria-describedby={errors.title ? "title-error" : undefined}
          />
        </FieldWrapper>

        <FieldWrapper
          label="Description"
          htmlFor="description"
          required
          error={errors.description?.message}
        >
          <textarea
            id="description"
            rows={4}
            placeholder="Describe the product in detail…"
            {...register("description", {
              required: "Description is required",
              minLength: { value: 10, message: "At least 10 characters" },
            })}
            className={cn(
              "w-full px-3 py-2 text-sm border rounded-lg bg-input-background placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 transition-colors resize-none",
              errors.description
                ? "border-destructive focus:ring-destructive/20 focus:border-destructive"
                : "border-border focus:ring-[#3b82f6]/20 focus:border-[#3b82f6]"
            )}
          />
        </FieldWrapper>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldWrapper
            label="Price (USD)"
            htmlFor="price"
            required
            error={errors.price?.message}
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none font-mono">
                $
              </span>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                {...register("price", {
                  required: "Price is required",
                  min: { value: 0.01, message: "Price must be > 0" },
                  valueAsNumber: true,
                })}
                className={cn(inputClass(!!errors.price), "pl-6 font-mono")}
              />
            </div>
          </FieldWrapper>

          <FieldWrapper
            label="Stock"
            htmlFor="stock"
            required
            error={errors.stock?.message}
          >
            <input
              id="stock"
              type="number"
              min="0"
              step="1"
              placeholder="0"
              {...register("stock", {
                required: "Stock is required",
                min: { value: 0, message: "Cannot be negative" },
                valueAsNumber: true,
              })}
              className={cn(inputClass(!!errors.stock), "font-mono")}
            />
          </FieldWrapper>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FieldWrapper label="Brand" htmlFor="brand" error={errors.brand?.message}>
            <input
              id="brand"
              type="text"
              placeholder="e.g. Apple"
              {...register("brand", {
                maxLength: { value: 60, message: "Max 60 characters" },
              })}
              className={inputClass(!!errors.brand)}
            />
          </FieldWrapper>

          <FieldWrapper
            label="Category"
            htmlFor="category"
            required
            error={errors.category?.message}
          >
            <select
              id="category"
              {...register("category", { required: "Category is required" })}
              className={cn(
                "w-full px-3 h-9 text-sm border rounded-lg bg-input-background focus:outline-none focus:ring-2 transition-colors cursor-pointer",
                errors.category
                  ? "border-destructive focus:ring-destructive/20 focus:border-destructive"
                  : "border-border focus:ring-[#3b82f6]/20 focus:border-[#3b82f6]"
              )}
            >
              <option value="">Select a category…</option>
              {categories?.map((cat) => (
                <option key={cat.slug} value={cat.slug}>
                  {cat.name}
                </option>
              ))}
            </select>
          </FieldWrapper>
        </div>

        <FieldWrapper
          label="Discount %"
          htmlFor="discount"
          hint="Optional. Enter 0 for no discount."
          error={errors.discountPercentage?.message}
        >
          <input
            id="discount"
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="0"
            {...register("discountPercentage", {
              min: { value: 0, message: "Cannot be negative" },
              max: { value: 100, message: "Cannot exceed 100" },
              valueAsNumber: true,
            })}
            className={cn(inputClass(!!errors.discountPercentage), "font-mono w-40")}
          />
        </FieldWrapper>

        {addProduct.isError && (
          <div
            role="alert"
            className="flex items-start gap-2 text-xs text-destructive bg-red-50 border border-red-200 rounded-lg px-3 py-2.5"
          >
            <AlertCircle size={13} className="mt-0.5 shrink-0" />
            Failed to add product. The catalog API rejected the request — this is a known limitation of the demo API.
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-1 border-t border-border">
          <Link
            to="/products"
            className="flex items-center gap-1.5 px-4 h-9 text-sm font-medium border border-border rounded-lg hover:bg-muted transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center gap-1.5 px-5 h-9 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3b82f6]/50"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Adding…
              </>
            ) : (
              <>
                <Package size={13} />
                Add product
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
