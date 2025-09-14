'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { InventoryState, InventoryAction, Product, Category, StockMovement, SearchFilters } from '@/types/inventory';
import { InventoryService } from '@/lib/inventoryService';

const initialFilters: SearchFilters = {
  query: '',
  category: 'all',
  status: 'all',
  stockLevel: 'all',
  sortBy: 'name',
  sortOrder: 'asc',
};

const initialState: InventoryState = {
  products: [],
  categories: [],
  movements: [],
  filters: initialFilters,
  selectedProduct: null,
  isLoading: false,
  error: null,
};

function inventoryReducer(state: InventoryState, action: InventoryAction): InventoryState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };

    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };

    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p => 
          p.id === action.payload.id ? action.payload : p
        ),
        selectedProduct: state.selectedProduct?.id === action.payload.id 
          ? action.payload 
          : state.selectedProduct
      };

    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload),
        selectedProduct: state.selectedProduct?.id === action.payload 
          ? null 
          : state.selectedProduct
      };

    case 'SET_CATEGORIES':
      return { ...state, categories: action.payload };

    case 'ADD_CATEGORY':
      return { ...state, categories: [...state.categories, action.payload] };

    case 'DELETE_CATEGORY':
      return { ...state, categories: state.categories.filter(c => c.id !== action.payload) };

    case 'ADD_MOVEMENT':
      return { ...state, movements: [...state.movements, action.payload] };

    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };

    case 'SELECT_PRODUCT':
      return { ...state, selectedProduct: action.payload };

    case 'UPDATE_STOCK':
      return {
        ...state,
        products: state.products.map(p => 
          p.id === action.payload.productId 
            ? { ...p, stock: action.payload.quantity, updatedAt: new Date() }
            : p
        )
      };

    default:
      return state;
  }
}

interface InventoryContextType {
  state: InventoryState;
  dispatch: React.Dispatch<InventoryAction>;
  actions: {
    loadData: () => void;
    addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void;
    updateProduct: (id: string, updates: Partial<Product>) => void;
    deleteProduct: (id: string) => void;
    addCategory: (category: Omit<Category, 'id' | 'createdAt'>) => void;
    deleteCategory: (id: string) => void;
    addStockMovement: (movement: Omit<StockMovement, 'id' | 'createdAt'>) => void;
    updateStock: (productId: string, quantity: number, reason: string) => void;
    setFilters: (filters: Partial<SearchFilters>) => void;
    selectProduct: (product: Product | null) => void;
    getFilteredProducts: () => Product[];
    exportData: () => void;
    importData: (file: File) => Promise<boolean>;
  };
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

interface InventoryProviderProps {
  children: ReactNode;
}

export function InventoryProvider({ children }: InventoryProviderProps) {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);

  // Load initial data
  const loadData = () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const products = InventoryService.getProducts();
      const categories = InventoryService.getCategories();
      const movements = InventoryService.getMovements();

      dispatch({ type: 'SET_PRODUCTS', payload: products });
      dispatch({ type: 'SET_CATEGORIES', payload: categories });
      dispatch({ type: 'ADD_MOVEMENT', payload: movements[0] }); // Just to initialize
      dispatch({ type: 'SET_ERROR', payload: null });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error loading inventory data' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Product actions
  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newProduct = InventoryService.addProduct(productData);
      dispatch({ type: 'ADD_PRODUCT', payload: newProduct });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error adding product' });
    }
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    try {
      const updatedProduct = InventoryService.updateProduct(id, updates);
      if (updatedProduct) {
        dispatch({ type: 'UPDATE_PRODUCT', payload: updatedProduct });
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error updating product' });
    }
  };

  const deleteProduct = (id: string) => {
    try {
      InventoryService.deleteProduct(id);
      dispatch({ type: 'DELETE_PRODUCT', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error deleting product' });
    }
  };

  // Category actions
  const addCategory = (categoryData: Omit<Category, 'id' | 'createdAt'>) => {
    try {
      const newCategory = InventoryService.addCategory(categoryData);
      dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error adding category' });
    }
  };

  const deleteCategory = (id: string) => {
    try {
      InventoryService.deleteCategory(id);
      dispatch({ type: 'DELETE_CATEGORY', payload: id });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error deleting category' });
    }
  };

  // Stock movement actions
  const addStockMovement = (movementData: Omit<StockMovement, 'id' | 'createdAt'>) => {
    try {
      const newMovement = InventoryService.addMovement(movementData);
      dispatch({ type: 'ADD_MOVEMENT', payload: newMovement });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error adding stock movement' });
    }
  };

  const updateStock = (productId: string, quantity: number, reason: string) => {
    try {
      const product = state.products.find(p => p.id === productId);
      if (!product) return;

      const movement = {
        productId,
        type: quantity > product.stock ? 'in' : 'out' as 'in' | 'out',
        quantity: Math.abs(quantity - product.stock),
        reason,
        createdBy: 'System',
      };

      addStockMovement(movement);
      dispatch({ type: 'UPDATE_STOCK', payload: { productId, quantity } });
      
      // Update in storage
      InventoryService.updateProduct(productId, { stock: quantity, updatedAt: new Date() });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error updating stock' });
    }
  };

  // Filter and search actions
  const setFilters = (filters: Partial<SearchFilters>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const getFilteredProducts = (): Product[] => {
    let filtered = [...state.products];

    // Apply search
    if (state.filters.query) {
      filtered = InventoryService.searchProducts(filtered, state.filters.query);
    }

    // Apply filters
    filtered = InventoryService.filterProducts(filtered, state.filters);

    // Apply sorting
    filtered = InventoryService.sortProducts(filtered, state.filters.sortBy, state.filters.sortOrder);

    return filtered;
  };

  // Selection actions
  const selectProduct = (product: Product | null) => {
    dispatch({ type: 'SELECT_PRODUCT', payload: product });
  };

  // Export/Import actions
  const exportData = () => {
    const data = InventoryService.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `inventory_export_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const importData = async (file: File): Promise<boolean> => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const success = InventoryService.importData(data);
      
      if (success) {
        loadData(); // Reload data after import
      }
      
      return success;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: 'Error importing data' });
      return false;
    }
  };

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const actions = {
    loadData,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    deleteCategory,
    addStockMovement,
    updateStock,
    setFilters,
    selectProduct,
    getFilteredProducts,
    exportData,
    importData,
  };

  return (
    <InventoryContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}

export { InventoryContext };