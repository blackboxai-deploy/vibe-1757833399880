'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useInventory } from '@/hooks/useInventory';
import { Category } from '@/types/inventory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface CategoryFormData {
  name: string;
  description: string;
  color: string;
}

const DEFAULT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Yellow
  '#8B5CF6', // Purple
  '#EF4444', // Red
  '#06B6D4', // Cyan
  '#84CC16', // Lime
  '#F97316', // Orange
  '#EC4899', // Pink
  '#6B7280', // Gray
];

export function CategoryManager() {
  const { state, actions } = useInventory();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CategoryFormData>({
    defaultValues: {
      name: '',
      description: '',
      color: DEFAULT_COLORS[0],
    }
  });

  const onSubmit = async (data: CategoryFormData) => {
    try {
      actions.addCategory({
        ...data,
        color: selectedColor,
      });

      toast.success('Categoría creada correctamente');
      reset();
      setSelectedColor(DEFAULT_COLORS[0]);
      setIsFormOpen(false);
    } catch (error) {
      toast.error('Error al crear la categoría');
    }
  };

  const handleDeleteCategory = async (category: Category) => {
    // Check if category is being used
    const productsUsingCategory = state.products.filter(p => p.category === category.name);
    
    if (productsUsingCategory.length > 0) {
      toast.error(
        `No se puede eliminar la categoría "${category.name}" porque tiene ${productsUsingCategory.length} producto(s) asignado(s)`
      );
      return;
    }

    if (window.confirm(`¿Estás seguro de que quieres eliminar la categoría "${category.name}"?`)) {
      setDeletingId(category.id);
      try {
        actions.deleteCategory(category.id);
        toast.success('Categoría eliminada correctamente');
      } catch (error) {
        toast.error('Error al eliminar la categoría');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const getCategoryProductCount = (categoryName: string) => {
    return state.products.filter(p => p.category === categoryName).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Categorías</h2>
          <p className="text-gray-600">Gestiona las categorías de productos</p>
        </div>
        <Button onClick={() => setIsFormOpen(!isFormOpen)}>
          {isFormOpen ? 'Cancelar' : 'Nueva Categoría'}
        </Button>
      </div>

      {/* New Category Form */}
      {isFormOpen && (
        <Card>
          <CardHeader>
            <CardTitle>Nueva Categoría</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre *</Label>
                  <Input
                    id="name"
                    {...register('name', { required: 'El nombre es requerido' })}
                    placeholder="Nombre de la categoría"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {DEFAULT_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${
                          selectedColor === color ? 'border-gray-800' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  {...register('description')}
                  placeholder="Descripción de la categoría (opcional)"
                  rows={2}
                />
              </div>

              <div className="flex space-x-3">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creando...' : 'Crear Categoría'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormOpen(false)}
                >
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Categories List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {state.categories.map(category => {
          const productCount = getCategoryProductCount(category.name);
          
          return (
            <Card key={category.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                    <div>
                      <h3 className="font-medium text-gray-900">{category.name}</h3>
                      {category.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-xs">
                    {productCount} producto{productCount !== 1 ? 's' : ''}
                  </Badge>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteCategory(category)}
                    disabled={deletingId === category.id || productCount > 0}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    {deletingId === category.id ? 'Eliminando...' : 'Eliminar'}
                  </Button>
                </div>

                <div className="mt-2 text-xs text-gray-400">
                  Creada: {new Date(category.createdAt).toLocaleDateString('es')}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {state.categories.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-3xl text-gray-400">🏷️</span>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay categorías registradas
          </h3>
          <p className="text-gray-500 mb-4">
            Las categorías te ayudan a organizar mejor tu inventario
          </p>
          <Button onClick={() => setIsFormOpen(true)}>
            Crear Primera Categoría
          </Button>
        </div>
      )}
    </div>
  );
}