import { Product, Category, StockMovement, InventoryStats, ExportData } from '@/types/inventory';

const STORAGE_KEYS = {
  PRODUCTS: 'inventory_products',
  CATEGORIES: 'inventory_categories',
  MOVEMENTS: 'inventory_movements',
};

export class InventoryService {
  // Products
  static getProducts(): Product[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return stored ? JSON.parse(stored) : this.getDefaultProducts();
  }

  static saveProducts(products: Product[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }

  static addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Product {
    const newProduct: Product = {
      ...product,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const products = this.getProducts();
    products.push(newProduct);
    this.saveProducts(products);
    return newProduct;
  }

  static updateProduct(id: string, updates: Partial<Product>): Product | null {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updatedProduct = {
      ...products[index],
      ...updates,
      updatedAt: new Date(),
    };
    products[index] = updatedProduct;
    this.saveProducts(products);
    return updatedProduct;
  }

  static deleteProduct(id: string): boolean {
    const products = this.getProducts().filter(p => p.id !== id);
    this.saveProducts(products);
    return true;
  }

  // Categories
  static getCategories(): Category[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
    return stored ? JSON.parse(stored) : this.getDefaultCategories();
  }

  static saveCategories(categories: Category[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
  }

  static addCategory(category: Omit<Category, 'id' | 'createdAt'>): Category {
    const newCategory: Category = {
      ...category,
      id: this.generateId(),
      createdAt: new Date(),
    };
    const categories = this.getCategories();
    categories.push(newCategory);
    this.saveCategories(categories);
    return newCategory;
  }

  static deleteCategory(id: string): boolean {
    const categories = this.getCategories().filter(c => c.id !== id);
    this.saveCategories(categories);
    return true;
  }

  // Stock Movements
  static getMovements(): StockMovement[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
    return stored ? JSON.parse(stored) : [];
  }

  static saveMovements(movements: StockMovement[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(movements));
  }

  static addMovement(movement: Omit<StockMovement, 'id' | 'createdAt'>): StockMovement {
    const newMovement: StockMovement = {
      ...movement,
      id: this.generateId(),
      createdAt: new Date(),
    };
    const movements = this.getMovements();
    movements.push(newMovement);
    this.saveMovements(movements);
    return newMovement;
  }

  // Statistics
  static getStats(): InventoryStats {
    const products = this.getProducts();
    const movements = this.getMovements();
    const categories = this.getCategories();

    const totalValue = products.reduce((sum, product) => sum + (product.price * product.stock), 0);
    const lowStockCount = products.filter(p => p.stock <= p.minStock && p.stock > 0).length;
    const outOfStockCount = products.filter(p => p.stock === 0).length;
    const recentMovements = movements.filter(m => {
      const dayAgo = new Date();
      dayAgo.setDate(dayAgo.getDate() - 1);
      return new Date(m.createdAt) > dayAgo;
    }).length;

    return {
      totalProducts: products.length,
      totalValue,
      lowStockCount,
      outOfStockCount,
      totalCategories: categories.length,
      recentMovements,
    };
  }

  // Search and Filter
  static searchProducts(products: Product[], query: string): Product[] {
    if (!query.trim()) return products;
    
    const searchTerm = query.toLowerCase();
    return products.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      product.sku.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm)
    );
  }

  static filterProducts(products: Product[], filters: any): Product[] {
    return products.filter(product => {
      // Category filter
      if (filters.category && filters.category !== 'all' && product.category !== filters.category) {
        return false;
      }

      // Status filter
      if (filters.status && filters.status !== 'all' && product.status !== filters.status) {
        return false;
      }

      // Stock level filter
      if (filters.stockLevel && filters.stockLevel !== 'all') {
        if (filters.stockLevel === 'out-of-stock' && product.stock > 0) return false;
        if (filters.stockLevel === 'low-stock' && (product.stock > product.minStock || product.stock === 0)) return false;
        if (filters.stockLevel === 'in-stock' && product.stock <= product.minStock) return false;
      }

      return true;
    });
  }

  static sortProducts(products: Product[], sortBy: string, sortOrder: 'asc' | 'desc'): Product[] {
    return [...products].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'price':
          comparison = a.price - b.price;
          break;
        case 'stock':
          comparison = a.stock - b.stock;
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
  }

  // Export/Import
  static exportData(): ExportData {
    return {
      products: this.getProducts(),
      categories: this.getCategories(),
      movements: this.getMovements(),
      exportedAt: new Date(),
    };
  }

  static importData(data: ExportData): boolean {
    try {
      this.saveProducts(data.products);
      this.saveCategories(data.categories);
      this.saveMovements(data.movements);
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }

  // Utilities
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private static getDefaultProducts(): Product[] {
    const defaultProducts: Product[] = [
      {
        id: '1',
        name: 'Laptop HP Pavilion',
        description: 'Laptop para oficina con procesador Intel i5',
        category: 'Electrónicos',
        price: 1200000,
        stock: 15,
        minStock: 5,
        sku: 'LAP-HP-001',
        barcode: '1234567890123',
        image: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/d07abbd8-d7ee-4cc7-9dc5-ff868f16af5b.png',
        status: 'active',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: '2',
        name: 'Mouse Inalámbrico Logitech',
        description: 'Mouse ergonómico inalámbrico con precisión óptica',
        category: 'Accesorios',
        price: 85000,
        stock: 3,
        minStock: 10,
        sku: 'MOU-LOG-002',
        barcode: '2345678901234',
        image: 'https://placehold.co/400x300?text=Mouse+Logitech+inalambrico+ergonomico+negro',
        status: 'active',
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
      },
      {
        id: '3',
        name: 'Monitor Samsung 24"',
        description: 'Monitor LED Full HD 24 pulgadas para oficina',
        category: 'Electrónicos',
        price: 450000,
        stock: 8,
        minStock: 3,
        sku: 'MON-SAM-003',
        barcode: '3456789012345',
        image: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/29be42ed-2901-4488-875d-5bc2e608528d.png',
        status: 'active',
        createdAt: new Date('2024-01-25'),
        updatedAt: new Date('2024-01-25'),
      },
      {
        id: '4',
        name: 'Teclado Mecánico RGB',
        description: 'Teclado mecánico gaming con iluminación RGB',
        category: 'Accesorios',
        price: 150000,
        stock: 0,
        minStock: 5,
        sku: 'TEC-RGB-004',
        barcode: '4567890123456',
        image: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/a6e2b719-75ad-4c02-bb90-4a1d6d544e65.png',
        status: 'active',
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
      },
      {
        id: '5',
        name: 'Impresora Canon Pixma',
        description: 'Impresora multifuncional de tinta para oficina',
        category: 'Oficina',
        price: 280000,
        stock: 12,
        minStock: 4,
        sku: 'IMP-CAN-005',
        barcode: '5678901234567',
        image: 'https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/4bbb9bec-7a54-4370-a97a-86cf5c2d8737.png',
        status: 'active',
        createdAt: new Date('2024-02-05'),
        updatedAt: new Date('2024-02-05'),
      }
    ];

    this.saveProducts(defaultProducts);
    return defaultProducts;
  }

  private static getDefaultCategories(): Category[] {
    const defaultCategories: Category[] = [
      {
        id: '1',
        name: 'Electrónicos',
        description: 'Dispositivos electrónicos y tecnología',
        color: '#3B82F6',
        createdAt: new Date('2024-01-01'),
      },
      {
        id: '2',
        name: 'Accesorios',
        description: 'Accesorios para computadoras y dispositivos',
        color: '#10B981',
        createdAt: new Date('2024-01-01'),
      },
      {
        id: '3',
        name: 'Oficina',
        description: 'Equipos y suministros de oficina',
        color: '#F59E0B',
        createdAt: new Date('2024-01-01'),
      },
      {
        id: '4',
        name: 'Software',
        description: 'Licencias de software y aplicaciones',
        color: '#8B5CF6',
        createdAt: new Date('2024-01-01'),
      }
    ];

    this.saveCategories(defaultCategories);
    return defaultCategories;
  }
}