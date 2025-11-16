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
  totalPointDescription?: string; // Description of what points can be redeemed for
  totalPointPossibleRedeem?: number; // Number of items that can be redeemed
  totalPointImage?: string; // Image URL for the redeemable item (coffee latte)
  listFavoriteStore?: FavoriteStore[]; // Optional array of favorite stores (max 3)
  deliveryCount?: number; // Number of delivery transactions
  pickupCount?: number; // Number of pickup transactions
}

