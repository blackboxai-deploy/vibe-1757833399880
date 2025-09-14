'use client';

import React, { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { Product } from '@/types/inventory';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ProductListProps {
  onEditProduct?: (product: Product) => void;
  onSelectProduct?: (product: Product) => void;
}

export function ProductList({ onEditProduct, onSelectProduct }: ProductListProps) {
  const { state, actions } = useInventory();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredProducts = actions.getFilteredProducts();

  const handleDeleteProduct = async (product: Product) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar "${product.name}"?`)) {
      setDeletingId(product.id);
      try {
        actions.deleteProduct(product.id);
        toast.success('Producto eliminado correctamente');
      } catch (error) {
        toast.error('Error al eliminar el producto');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(price);
  };

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) {
      return { text: 'Sin stock', color: 'destructive' as const };
    } else if (product.stock <= product.minStock) {
      return { text: 'Stock bajo', color: 'secondary' as const };
    } else {
      return { text: 'En stock', color: 'default' as const };
    }
  };

  const getCategoryColor = (categoryName: string) => {
    const category = state.categories.find(c => c.name === categoryName);
    return category?.color || '#6B7280';
  };

  if (state.isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="h-32 bg-gray-200 rounded-lg" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="flex justify-between">
                  <div className="h-6 bg-gray-200 rounded w-16" />
                  <div className="h-6 bg-gray-200 rounded w-12" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (filteredProducts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <span className="text-3xl text-gray-400">📦</span>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {state.filters.query || state.filters.category !== 'all' ? 
            'No se encontraron productos' : 
            'No hay productos registrados'
          }
        </h3>
        <p className="text-gray-500 mb-4">
          {state.filters.query || state.filters.category !== 'all' ? 
            'Intenta ajustar los filtros de búsqueda' : 
            'Comienza agregando tu primer producto al inventario'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredProducts.map(product => {
          const stockStatus = getStockStatus(product);
          
          return (
            <Card 
              key={product.id} 
              className={`hover:shadow-md transition-shadow duration-200 ${
                product.status === 'inactive' ? 'opacity-60' : ''
              }`}
            >
              <CardContent className="p-4">
                {/* Product Image */}
                <div className="aspect-square mb-3 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={product.image || `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/0eb2537d-aa52-4940-a197-13e2d3f7f4f2.png}`}
                    alt={product.name}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-200"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = `https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/fa17178c-2f59-4f30-918b-dd892aa5e9b9.png}`;
                    }}
                  />
                </div>

                {/* Product Info */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <h3 
                      className="font-medium text-gray-900 text-sm leading-tight cursor-pointer hover:text-blue-600"
                      onClick={() => onSelectProduct?.(product)}
                    >
                      {product.name}
                    </h3>
                    {product.status === 'inactive' && (
                      <Badge variant="outline" className="text-xs ml-2">
                        Inactivo
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-gray-500 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium text-white"
                      style={{ backgroundColor: getCategoryColor(product.category) }}
                    >
                      {product.category}
                    </div>
                    <Badge variant={stockStatus.color} className="text-xs">
                      {stockStatus.text}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {formatPrice(product.price)}
                      </p>
                      <p className="text-xs text-gray-500">
                        Stock: {product.stock} unidades
                      </p>
                    </div>
                    <p className="text-xs text-gray-400">
                      {product.sku}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditProduct?.(product)}
                      className="flex-1 h-8 text-xs"
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteProduct(product)}
                      disabled={deletingId === product.id}
                      className="flex-1 h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      {deletingId === product.id ? 'Eliminando...' : 'Eliminar'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}