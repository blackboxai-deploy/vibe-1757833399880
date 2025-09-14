'use client';

import React, { useState } from 'react';
import { useInventory } from '@/hooks/useInventory';
import { InventoryService } from '@/lib/inventoryService';
import { Product } from '@/types/inventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ProductList } from './ProductList';
import { ProductForm } from './ProductForm';
import { CategoryManager } from './CategoryManager';
import { SearchFilters } from './SearchFilters';
import { StockAlert } from './StockAlert';
import { InventoryCharts } from './InventoryCharts';
import { FloatingActionButton } from './FloatingActionButton';

export function InventoryDashboard() {
  const { state, actions } = useInventory();
  const [activeTab, setActiveTab] = useState('overview');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const stats = InventoryService.getStats();

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setShowProductForm(true);
    setActiveTab('products');
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    actions.selectProduct(product);
  };

  const handleSelectProductById = (productId: string) => {
    const product = state.products.find(p => p.id === productId);
    if (product) {
      handleSelectProduct(product);
    }
  };

  const handleProductFormSuccess = () => {
    setShowProductForm(false);
    setEditingProduct(null);
    setSelectedProduct(null);
  };

  const handleProductFormCancel = () => {
    setShowProductForm(false);
    setEditingProduct(null);
  };

  const handleNewProduct = () => {
    setEditingProduct(null);
    setShowProductForm(true);
    setActiveTab('products');
  };

  const handleExportData = () => {
    actions.exportData();
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      actions.importData(file);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">📦</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Inventario Flutter</h1>
                <p className="text-sm text-gray-500">Sistema de gestión</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" onClick={handleExportData}>
                Exportar
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
                id="import-file"
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => document.getElementById('import-file')?.click()}
              >
                Importar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="overview">Resumen</TabsTrigger>
            <TabsTrigger value="products">Productos</TabsTrigger>
            <TabsTrigger value="categories">Categorías</TabsTrigger>
            <TabsTrigger value="reports">Reportes</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Total Productos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.totalProducts}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {state.products.filter(p => p.status === 'active').length} activos
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Valor Total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(stats.totalValue)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Inventario completo
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Alertas de Stock
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.lowStockCount + stats.outOfStockCount}
                  </div>
                  <div className="flex space-x-2 mt-1">
                    <Badge variant="destructive" className="text-xs">
                      {stats.outOfStockCount} sin stock
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {stats.lowStockCount} bajo
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">
                    Categorías
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">
                    {stats.totalCategories}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Tipos de productos
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Stock Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Alertas de Stock
                </h3>
                <StockAlert onProductSelect={handleSelectProductById} />
              </div>

              {/* Quick Actions */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Acciones Rápidas
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleNewProduct}>
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-blue-600 text-xl">+</span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">Nuevo Producto</h4>
                      <p className="text-sm text-gray-500">Agregar producto al inventario</p>
                    </CardContent>
                  </Card>

                  <Card 
                    className="hover:shadow-md transition-shadow cursor-pointer" 
                    onClick={() => setActiveTab('categories')}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-green-600 text-xl">🏷️</span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">Gestionar Categorías</h4>
                      <p className="text-sm text-gray-500">Organizar productos por categorías</p>
                    </CardContent>
                  </Card>

                  <Card 
                    className="hover:shadow-md transition-shadow cursor-pointer" 
                    onClick={() => setActiveTab('reports')}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-purple-600 text-xl">📊</span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">Ver Reportes</h4>
                      <p className="text-sm text-gray-500">Análisis y estadísticas</p>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={handleExportData}>
                    <CardContent className="p-6 text-center">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <span className="text-orange-600 text-xl">📄</span>
                      </div>
                      <h4 className="font-medium text-gray-900 mb-1">Exportar Datos</h4>
                      <p className="text-sm text-gray-500">Descargar inventario completo</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            {showProductForm ? (
              <ProductForm
                product={editingProduct || undefined}
                onSuccess={handleProductFormSuccess}
                onCancel={handleProductFormCancel}
              />
            ) : (
              <>
                <SearchFilters />
                <ProductList
                  onEditProduct={handleEditProduct}
                  onSelectProduct={handleSelectProduct}
                />
              </>
            )}
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <CategoryManager />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Reportes y Análisis</h2>
                <p className="text-gray-600">Visualización de datos del inventario</p>
              </div>
              <InventoryCharts />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Button */}
      <FloatingActionButton
        onClick={handleNewProduct}
        className={activeTab === 'products' && !showProductForm ? 'block' : 'hidden'}
      />
    </div>
  );
}