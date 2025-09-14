'use client';

import React from 'react';
import { useInventory } from '@/hooks/useInventory';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function SearchFilters() {
  const { state, actions } = useInventory();
  const { filters } = state;

  const handleSearchChange = (query: string) => {
    actions.setFilters({ query });
  };

  const handleCategoryChange = (category: string) => {
    actions.setFilters({ category });
  };

  const handleStatusChange = (status: string) => {
    actions.setFilters({ status: status as 'all' | 'active' | 'inactive' });
  };

  const handleStockLevelChange = (stockLevel: string) => {
    actions.setFilters({ 
      stockLevel: stockLevel as 'all' | 'in-stock' | 'low-stock' | 'out-of-stock' 
    });
  };

  const handleSortChange = (sortBy: string) => {
    actions.setFilters({ sortBy: sortBy as 'name' | 'price' | 'stock' | 'createdAt' });
  };

  const handleSortOrderChange = () => {
    actions.setFilters({ 
      sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' 
    });
  };

  const clearFilters = () => {
    actions.setFilters({
      query: '',
      category: 'all',
      status: 'all',
      stockLevel: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
    });
  };

  const hasActiveFilters = 
    filters.query !== '' ||
    filters.category !== 'all' ||
    filters.status !== 'all' ||
    filters.stockLevel !== 'all' ||
    filters.sortBy !== 'name' ||
    filters.sortOrder !== 'asc';

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div>
            <Input
              placeholder="Buscar productos por nombre, descripción o SKU..."
              value={filters.query}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Category Filter */}
            <Select value={filters.category} onValueChange={handleCategoryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Todas las categorías" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {state.categories.map(category => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={filters.status} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue placeholder="Todos los estados" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="active">Activos</SelectItem>
                <SelectItem value="inactive">Inactivos</SelectItem>
              </SelectContent>
            </Select>

            {/* Stock Level Filter */}
            <Select value={filters.stockLevel} onValueChange={handleStockLevelChange}>
              <SelectTrigger>
                <SelectValue placeholder="Nivel de stock" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los niveles</SelectItem>
                <SelectItem value="in-stock">Con stock</SelectItem>
                <SelectItem value="low-stock">Stock bajo</SelectItem>
                <SelectItem value="out-of-stock">Sin stock</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <div className="flex space-x-2">
              <Select value={filters.sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nombre</SelectItem>
                  <SelectItem value="price">Precio</SelectItem>
                  <SelectItem value="stock">Stock</SelectItem>
                  <SelectItem value="createdAt">Fecha</SelectItem>
                </SelectContent>
              </Select>
              
              <Button
                variant="outline"
                size="icon"
                onClick={handleSortOrderChange}
                className="shrink-0"
              >
                {filters.sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-sm text-gray-600">
                Filtros activos
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clearFilters}
                className="text-blue-600 hover:text-blue-700"
              >
                Limpiar filtros
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}