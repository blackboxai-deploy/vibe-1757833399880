export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  sku: string;
  barcode?: string;
  image?: string;
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: Date;
}

export interface StockMovement {
  id: string;
  productId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  notes?: string;
  createdAt: Date;
  createdBy: string;
}

export interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalCategories: number;
  recentMovements: number;
}

export interface SearchFilters {
  query: string;
  category: string;
  status: 'all' | 'active' | 'inactive';
  stockLevel: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';
  sortBy: 'name' | 'price' | 'stock' | 'createdAt';
  sortOrder: 'asc' | 'desc';
}

export interface InventoryState {
  products: Product[];
  categories: Category[];
  movements: StockMovement[];
  filters: SearchFilters;
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;
}

export type InventoryAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'SET_CATEGORIES'; payload: Category[] }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_MOVEMENT'; payload: StockMovement }
  | { type: 'SET_FILTERS'; payload: Partial<SearchFilters> }
  | { type: 'SELECT_PRODUCT'; payload: Product | null }
  | { type: 'UPDATE_STOCK'; payload: { productId: string; quantity: number } };

export interface ExportData {
  products: Product[];
  categories: Category[];
  movements: StockMovement[];
  exportedAt: Date;
}