"use client";

import Image from "next/image";
import { Plus } from "lucide-react";
import { useState } from "react";
import type { MenuItem } from "@/types/MenuItem";

interface Category {
  id: number;
  name: string;
}

interface ProductGridProps {
  categories: Category[];
  items: MenuItem[];
  searchTerm: string;
  onAddItem: (item: MenuItem) => void;
  onItemClick: (item: MenuItem) => void;
}

// Colores para las categorías
const categoryColors = [
  'bg-gray-700 text-white',
  'bg-blue-600 text-white', 
  'bg-indigo-600 text-white',
  'bg-green-600 text-white',
  'bg-yellow-600 text-white',
  'bg-red-600 text-white',
  'bg-purple-600 text-white',
  'bg-pink-600 text-white',
];

export default function ProductGrid({
  categories,
  items,
  searchTerm,
  onAddItem,
  onItemClick,
}: ProductGridProps) {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  

  // Filtrar items por búsqueda
  const filteredItems = searchTerm
    ? items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : items;

  // Filtrar por categoría seleccionada o búsqueda y ordenar correctamente
  const displayItems = (selectedCategory && !searchTerm
    ? filteredItems.filter(item => item.category_id === selectedCategory)
    : filteredItems)
    .sort((a, b) => {
      // Primero ordenar por category_id, luego por display_order
      if (a.category_id !== b.category_id) {
        return (a.category_id || 0) - (b.category_id || 0);
      }
      return (a.display_order || 0) - (b.display_order || 0);
    });


  // Contar items por categoría
  const categoriesWithCount = categories.map(category => ({
    ...category,
    count: items.filter(item => item.category_id === category.id).length
  }));

  return (
    <div className="space-y-4">
      {/* Botones de categorías */}
      <div className="grid grid-cols-4 gap-3">
        {/* Botón "Todos" */}
        <button
          onClick={() => setSelectedCategory(null)}
          className={`p-4 rounded-lg text-sm font-medium transition-colors ${
            selectedCategory === null 
              ? 'bg-gray-700 text-white' 
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <div className="text-lg font-bold">Todos</div>
          <div className="text-xs opacity-80">{items.length} Opciones</div>
        </button>
        
        {categoriesWithCount.map((category, index) => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={`p-4 rounded-lg text-sm font-medium transition-colors ${
              selectedCategory === category.id 
                ? categoryColors[index % categoryColors.length]
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <div className="text-lg font-bold">{category.name}</div>
            <div className="text-xs opacity-80">{category.count} Opciones</div>
          </button>
        ))}
      </div>

      {/* Grid de productos */}
      <div className="grid grid-cols-4 gap-4">
        {displayItems.map((item) => (
          <ProductCard
            key={item.id}
            item={item}
            onAddItem={onAddItem}
            onItemClick={onItemClick}
          />
        ))}
      </div>

      {displayItems.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No se encontraron productos</p>
        </div>
      )}
    </div>
  );
}

function ProductCard({
  item,
  onAddItem,
  onItemClick,
}: {
  item: MenuItem;
  onAddItem: (item: MenuItem) => void;
  onItemClick: (item: MenuItem) => void;
}) {
  
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow ${
        !item.is_available ? "opacity-60" : "cursor-pointer"
      }`}
      onClick={() => item.is_available && onItemClick(item)}
    >
      {/* Imagen */}
      <div className="relative aspect-square bg-gray-100">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">🍽️</span>
          </div>
        )}
        
        {/* Botón agregar superpuesto */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddItem(item);
          }}
          disabled={!item.is_available}
          className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Información del producto */}
      <div className="p-3">
        <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
          {item.name}
        </h4>
        <p className="text-sm font-bold text-gray-900">
          {(item.price ?? 0).toFixed(2)} Bs.
        </p>
      </div>
    </div>
  );
}