export interface ProductFavorite {
  productName: string;
  countCups: number;
  productImage?: string; // Optional product image URL
}

export interface ServerResponse {
  userName: string;
  trxCount: number;
  listProductFavorite?: ProductFavorite[]; // Optional array of favorite products
}

