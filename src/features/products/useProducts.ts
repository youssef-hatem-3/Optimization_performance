import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getProducts } from "../../lib/api";

export type ProductSortBy = "price" | "rating";

type UseProductsOptions = {
  page: number;
  pageSize: number;
  sortBy: ProductSortBy;
};

export function useProducts({ page, pageSize, sortBy }: UseProductsOptions) {
  const order = sortBy === "price" ? "asc" : "desc";

  return useQuery({
    queryKey: ["products", { page, pageSize, sortBy, order }],
    queryFn: () => getProducts({ page, pageSize, sortBy, order }),
    placeholderData: keepPreviousData,
  });
}
