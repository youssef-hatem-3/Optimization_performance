import { LazyLoadImage } from "react-lazy-load-image-component";
import { useEffect, useMemo, useState } from "react";
import { debounce } from "../../lib/utils";
import type { Product } from "../../types/models";
import { useProducts, type ProductSortBy } from "./useProducts";

const PRODUCTS_PER_PAGE = 12;

export function ProductsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState<ProductSortBy>("price");
  const [page, setPage] = useState(0);
  const updateSearch = useMemo(
    () => debounce((value: string) => setSearch(value), 300),
    [],
  );

  useEffect(() => {
    updateSearch(searchInput);
    return updateSearch.cancel;
  }, [searchInput, updateSearch]);

  const { data, isLoading, isFetching } = useProducts({
    page,
    pageSize: PRODUCTS_PER_PAGE,
    sortBy,
  });
  const products = data?.products ?? [];
  const totalPages = Math.max(1, Math.ceil((data?.total ?? 0) / PRODUCTS_PER_PAGE));
  // PERFORMANCE PRACTICE: filtering and derived values are recalculated on every render.
  const visibleProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(search.toLowerCase()) &&
      (category === "all" || product.category === category),
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
            Products <span>{(data?.total ?? 0).toLocaleString()} total</span>
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
          value={searchInput}
          onChange={(event) => {
            setSearchInput(event.target.value);
            setPage(0);
          }}
          placeholder="Search products…"
        />
        <select
          value={category}
          onChange={(event) => {
            setCategory(event.target.value);
            setPage(0);
          }}
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
          onChange={(event) => {
            setSortBy(event.target.value as ProductSortBy);
            setPage(0);
          }}
        >
          <option value="price">Price</option>
          <option value="rating">Rating</option>
        </select>
      </div>
      <div className="product-grid">
        {visibleProducts.map((product: Product) => (
          <article key={product.id} className="product-card">
            <LazyLoadImage
              className="product-card-image"
              src={product.imageUrl}
              alt={product.name}
              width={320}
              height={240}
              threshold={200}
              placeholder={
                <span className="product-card-image" aria-hidden="true" />
              }
              decoding="async"
            />
            <span>{product.category}</span>
            <h3>{product.name}</h3>
            <strong>${product.price}</strong>
            <p>
              ★ {product.rating} · {product.quantity} in stock
            </p>
          </article>
        ))}
      </div>
      <div className="pagination">
        <button
          onClick={() => setPage((currentPage) => currentPage - 1)}
          disabled={page === 0 || isFetching}
        >
          Previous
        </button>
        <span>
          Page {page + 1} of {totalPages}
        </span>
        <button
          onClick={() => setPage((currentPage) => currentPage + 1)}
          disabled={!data || page >= totalPages - 1 || isFetching}
        >
          Next
        </button>
      </div>
    </>
  );
}
