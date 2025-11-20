export interface ProductFavorite {
  productName: string;
  countCups: number;
  productImage?: string; // Optional product image URL
}

export interface FavoriteStore {
  storeName: string;
  transactionCount: number;
  storeImage?: string; // Optional store image URL
}

export interface ServerResponse {
  userName: string;
  trxCount: number;
  listProductFavorite?: ProductFavorite[]; // Optional array of favorite products
  variantCount?: number; // Number of variants/products tried
  totalPoint?: number; // Total points accumulated
  totalPointPossibleRedeem?: number; // Number of items that can be redeemed
  totalPointProductName?: string; // Product name that can be redeemed (e.g., "Aren Latte")
  totalPointImage?: string; // Image URL for the redeemable item (coffee latte)
  listFavoriteStore?: FavoriteStore[]; // Optional array of favorite stores (max 3)
  deliveryCount?: number; // Number of delivery transactions
  pickupCount?: number; // Number of pickup transactions
  cheaperSubsDesc?: string; // Savings description (e.g., "325rb Rupiah")
  cheaperSubsAmount?: number; // Savings amount in rupiah (e.g., 325500)
  topRanking?: number; // Top ranking position (e.g., 50)
  listCircularImages?: string[]; // Array of image URLs for circular graphics (screen-12)
}

