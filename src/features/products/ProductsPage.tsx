import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { getProducts } from "../../lib/api";
import type { Product } from "../../types/models";

export function ProductsPage() {
  const { data: products = [], isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"price" | "rating">("price");
  // PERFORMANCE PRACTICE: all derived values and sorting are recalculated on every render, without memoization.
  const visibleProducts = products
    .filter(
      (product) =>
        product.name.toLowerCase().includes(search.toLowerCase()) &&
        (category === "all" || product.category === category),
    )
    .sort((a, b) =>
      sortBy === "price" ? a.price - b.price : b.rating - a.rating,
    );
  const averagePrice =
    products.reduce((sum, product) => sum + product.price, 0) /
    (products.length || 1);
  const inventoryValue = products.reduce(
    (sum, product) => sum + product.price * product.quantity,
    0,
  );
  const byCategory = products.reduce<Record<string, number>>(
    (counts, product) => ({
      ...counts,
      [product.category]: (counts[product.category] ?? 0) + 1,
    }),
    {},
  );
  if (isLoading) return <p>Loading products…</p>;
  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">Derived state</p>
          <h2>
            Products <span>{visibleProducts.length.toLocaleString()}</span>
          </h2>
          <p>
            Practice spotting derived work that should not need every render.
          </p>
        </div>
      </header>
      <section className="summary-grid compact">
        <article className="summary-card">
          <p>Average price</p>
          <strong>${averagePrice.toFixed(2)}</strong>
        </article>
        <article className="summary-card">
          <p>Inventory value</p>
          <strong>${inventoryValue.toLocaleString()}</strong>
        </article>
        <article className="summary-card">
          <p>Products / category</p>
          <strong>{Object.values(byCategory).join(" · ")}</strong>
        </article>
      </section>
      <div className="toolbar">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search products…"
        />
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          <option value="all">All categories</option>
          {Object.keys(byCategory)
            .sort()
            .map((item) => (
              <option key={item}>{item}</option>
            ))}
        </select>
        <select
          value={sortBy}
          onChange={(event) =>
            setSortBy(event.target.value as "price" | "rating")
          }
        >
          <option value="price">Price</option>
          <option value="rating">Rating</option>
        </select>
      </div>
      <div className="product-grid">
        {visibleProducts.map((product: Product) => (
          <article key={product.id} className="product-card">
            <span>{product.category}</span>
            <h3>{product.name}</h3>
            <strong>${product.price}</strong>
            <p>
              ★ {product.rating} · {product.quantity} in stock
            </p>
          </article>
        ))}
      </div>
    </>
  );
}
