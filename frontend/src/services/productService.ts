export interface ProductInfo {
  barcode: string;
  name: string;
  brand: string;
  category: string;
  image: string;
}

export const fetchProductByBarcode = async (barcode: string): Promise<ProductInfo | null> => {
  try {
    // We use the OpenFoodFacts API which is a free, global database of food products
    const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
    const data = await response.json();

    if (data.status === 1 && data.product) {
      return {
        barcode: barcode,
        name: data.product.product_name || 'Unknown Product',
        brand: data.product.brands || 'Unknown Brand',
        category: data.product.categories?.split(',')[0] || 'Uncategorized',
        image: data.product.image_url || data.product.image_front_url || ''
      };
    }
    return null; // Product not found in the global database
  } catch (error) {
    console.error("Error fetching product data:", error);
    return null;
  }
};
