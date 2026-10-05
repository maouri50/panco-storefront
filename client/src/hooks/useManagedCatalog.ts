import { catalogProducts, pancoAssetUrl, type Product } from "@/lib/catalog";
import { trpc } from "@/lib/trpc";

export function useManagedCatalog() {
  const catalogQuery = trpc.catalog.publicList.useQuery(undefined, {
    staleTime: 30_000,
    retry: 1,
  });

  const managedProducts = (catalogQuery.data ?? []).map((product) => ({
    ...product,
    image: pancoAssetUrl(product.image),
    gallery: product.gallery.map(pancoAssetUrl),
    colors: product.colors.map((color) => ({ ...color, image: pancoAssetUrl(color.image) })),
  }));
  const products: Product[] = managedProducts.length > 0 ? managedProducts : catalogProducts;

  return {
    products,
    isUsingManagedCatalog: managedProducts.length > 0,
    isLoading: catalogQuery.isLoading,
  };
}
