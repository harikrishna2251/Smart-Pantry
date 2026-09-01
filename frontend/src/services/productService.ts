export interface ProductInfo {
  barcode: string;
  name: string;
  brand: string;
  category: string;
  image: string;
}

export const fetchProductByBarcode = async (barcode: string): Promise<ProductInfo | null> => {
  try {
    // First, try OpenFoodFacts (great for global/European/US food)
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await response.json();

    if (data.status === 1 && data.product && data.product.product_name) {
      return {
        barcode: barcode,
        name: data.product.product_name,
        brand: data.product.brands || 'Unknown Brand',
        category: data.product.categories?.split(',')[0] || 'Uncategorized',
        image: data.product.image_url || data.product.image_front_url || ''
      };
    }

    // Fallback to UPCitemdb (great for Indian/Asian/US general products)
    const upcResponse = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`);
    const upcData = await upcResponse.json();

    if (upcData.code === 'OK' && upcData.items && upcData.items.length > 0) {
      const item = upcData.items[0];
      return {
        barcode: barcode,
        name: item.title,
        brand: item.brand || 'Unknown Brand',
        category: item.category || 'Uncategorized',
        image: item.images && item.images.length > 0 ? item.images[0] : ''
      };
    }

    return null; // Product not found in either database
  } catch (error) {
    console.error("Error fetching product data:", error);
    return null;
  }
};
