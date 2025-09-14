'use client';

import React from 'react';
import { useInventory } from '@/hooks/useInventory';
import { InventoryService } from '@/lib/inventoryService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#84CC16', '#F97316'];

export function InventoryCharts() {
  const { state } = useInventory();
  const stats = InventoryService.getStats();

  // Products by category
  const categoryData = state.categories.map(category => {
    const categoryProducts = state.products.filter(p => p.category === category.name);
    const totalValue = categoryProducts.reduce((sum, p) => sum + (p.price * p.stock), 0);
    
    return {
      name: category.name,
      products: categoryProducts.length,
      value: totalValue,
      stock: categoryProducts.reduce((sum, p) => sum + p.stock, 0)
    };
  });

  // Stock levels distribution
  const stockLevelsData = [
    {
      name: 'Con Stock',
      value: state.products.filter(p => p.stock > p.minStock).length,
      color: '#10B981'
    },
    {
      name: 'Stock Bajo',
      value: state.products.filter(p => p.stock <= p.minStock && p.stock > 0).length,
      color: '#F59E0B'
    },
    {
      name: 'Sin Stock',
      value: state.products.filter(p => p.stock === 0).length,
      color: '#EF4444'
    }
  ];

  // Top products by value
  const topProductsByValue = [...state.products]
    .map(p => ({
      name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
      value: p.price * p.stock,
      stock: p.stock
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  // Recent activity simulation (last 7 days)
  const recentActivity = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Simulate some activity
    const movements = Math.floor(Math.random() * 10) + 1;
    const value = Math.floor(Math.random() * 50000) + 10000;
    
    recentActivity.push({
      date: date.toLocaleDateString('es', { month: 'short', day: 'numeric' }),
      movements,
      value
    });
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6">
      {/* Stock Levels Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Distribución de Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockLevelsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stockLevelsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} productos`, 'Cantidad']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              {stockLevelsData.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">
                    {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Products by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Productos por Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}`, 'Productos']} />
                  <Bar dataKey="products" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Products by Value */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Productos con Mayor Valor en Inventario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsByValue} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={formatCurrency} />
                <YAxis dataKey="name" type="category" width={120} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Valor Total']} />
                <Bar dataKey="value" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Category Value Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Valor por Categoría</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={formatCurrency} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Valor Total']} />
                <Bar dataKey="value" fill="#8B5CF6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Actividad Reciente (7 días)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={recentActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="movements" 
                  stroke="#3B82F6" 
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}