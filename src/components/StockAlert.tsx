'use client';

import React from 'react';
import { useInventory } from '@/hooks/useInventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface StockAlertProps {
  onProductSelect?: (productId: string) => void;
}

export function StockAlert({ onProductSelect }: StockAlertProps) {
  const { state } = useInventory();
  
  const lowStockProducts = state.products.filter(
    product => product.stock <= product.minStock && product.stock > 0
  );
  
  const outOfStockProducts = state.products.filter(
    product => product.stock === 0
  );

  if (lowStockProducts.length === 0 && outOfStockProducts.length === 0) {
    return (
      <Card className="bg-green-50 border-green-200">
        <CardContent className="p-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xl">✓</span>
            </div>
            <div>
              <h3 className="text-green-800 font-medium">Stock Saludable</h3>
              <p className="text-green-600 text-sm">
                Todos los productos tienen stock suficiente
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Out of Stock Alerts */}
      {outOfStockProducts.length > 0 && (
        <Card className="bg-red-50 border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-800 flex items-center space-x-2">
              <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-sm">
                !
              </span>
              <span>Sin Stock ({outOfStockProducts.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {outOfStockProducts.slice(0, 3).map(product => (
              <div key={product.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-red-100">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.sku}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="destructive" className="text-xs">
                    0 unidades
                  </Badge>
                  {onProductSelect && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => onProductSelect(product.id)}
                    >
                      Ver
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {outOfStockProducts.length > 3 && (
              <p className="text-xs text-red-600 text-center pt-2">
                +{outOfStockProducts.length - 3} productos más sin stock
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-yellow-800 flex items-center space-x-2">
              <span className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-sm">
                ⚠
              </span>
              <span>Stock Bajo ({lowStockProducts.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {lowStockProducts.slice(0, 3).map(product => (
              <div key={product.id} className="flex items-center justify-between p-2 bg-white rounded-lg border border-yellow-100">
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-sm">{product.name}</p>
                  <p className="text-xs text-gray-500">{product.sku}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs border-yellow-300 text-yellow-700">
                    {product.stock} / {product.minStock} mín
                  </Badge>
                  {onProductSelect && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs"
                      onClick={() => onProductSelect(product.id)}
                    >
                      Ver
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {lowStockProducts.length > 3 && (
              <p className="text-xs text-yellow-600 text-center pt-2">
                +{lowStockProducts.length - 3} productos más con stock bajo
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}