// src/components/MenuItemFormModal.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { X } from "lucide-react";
import Image from "next/image";

// Reuse types from MenuManager
type Category = { id: number; name: string };
type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  category_id: number | null;
  is_available: boolean;
  image_url: string | null;
};

interface MenuItemFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: MenuItem) => void;
  categories: Category[];
  itemToEdit: MenuItem | null;
  categoryId: number | null; // To pre-select category when adding
  restaurantId: string; // Required for creating new items
}

export default function MenuItemFormModal({
  isOpen,
  onClose,
  onSave,
  categories,
  itemToEdit,
  categoryId,
  restaurantId,
}: MenuItemFormModalProps) {
  const supabase = createClient();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
  });
  const [imageUrl, setImageUrl] = useState<string | null>(null); // <-- Estado separado para la URL
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (itemToEdit) {
      setFormData({
        name: itemToEdit.name,
        description: itemToEdit.description ?? "",
        price: itemToEdit.price?.toString() ?? "",
        category_id: itemToEdit.category_id?.toString() ?? "",
      });
      setImageUrl(itemToEdit.image_url); // <-- Setear la URL de la imagen por separado
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        category_id: categoryId?.toString() ?? "",
      });
      setImageUrl(null); // <-- Limpiar la URL de la imagen
    }
  }, [itemToEdit, categoryId, isOpen]);

  if (!isOpen) return null;

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setImageUrl(null); // Limpiar la imagen anterior
    const fileName = `${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from("menu-images")
      .upload(fileName, file);

    if (error) {
      alert(`Storage Error: ${error.message}`);
    } else if (data) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("menu-images").getPublicUrl(data.path);
      setImageUrl(publicUrl); // <-- Actualizar el estado de la URL de la imagen
    }
    setIsUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Obtener el restaurant_id del usuario logueado
    let restaurantId: string | null = null;
    let displayOrder: number | null = null;

    if (!itemToEdit) {
      // Solo para elementos nuevos, obtener el restaurant_id y calcular display_order
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("restaurant_id")
          .eq("id", user.id)
          .single();
        restaurantId = profile?.restaurant_id || null;

        // Calcular el siguiente display_order en la categoría
        if (restaurantId && formData.category_id) {
          const { data: maxOrder } = await supabase
            .from("menu_items")
            .select("display_order")
            .eq("restaurant_id", restaurantId)
            .eq("category_id", parseInt(formData.category_id, 10))
            .not("display_order", "is", null)
            .order("display_order", { ascending: false })
            .limit(1)
            .single();

          displayOrder = (maxOrder?.display_order || 0) + 1;
        }
      }
    }

    // Validar que restaurantId esté presente para nuevos items
    if (!itemToEdit && !restaurantId) {
      alert("Error: No se puede crear un ítem sin restaurant_id");
      setSaving(false);
      return;
    }

    const dbData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price) || null,
      category_id: parseInt(formData.category_id, 10) || null,
      image_url: imageUrl,
      // SIEMPRE incluir restaurant_id para nuevos items
      ...(restaurantId && { restaurant_id: restaurantId }),
      ...(displayOrder && { display_order: displayOrder }),
    };

    let savedItem: MenuItem | null = null;

    if (itemToEdit) {
      // Update existing item
      const { data, error } = await supabase
        .from("menu_items")
        .update(dbData)
        .eq("id", itemToEdit.id)
        .select()
        .single();
      if (error) alert(`Error: ${error.message}`);
      else savedItem = data;
    } else {
      // Create new item
      const { data, error } = await supabase
        .from("menu_items")
        .insert(dbData)
        .select()
        .single();
      if (error) alert(`Error: ${error.message}`);
      else savedItem = data;
    }

    if (savedItem) {
      onSave(savedItem);
      onClose();
    }
    setIsSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-brightness-50 backdrop-saturate-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={24} />
        </button>
        <h2 className="text-xl font-bold mb-4">
          {itemToEdit ? "Editar Plato" : "Agregar Nuevo Plato"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre del Plato
            </label>
            <input
              type="text"
              name="name"
              id="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Descripción
            </label>
            <textarea
              name="description"
              id="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700"
            >
              Precio
            </label>
            <input
              type="number"
              name="price"
              id="price"
              value={formData.price}
              onChange={handleInputChange}
              step="0.01"
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="category_id"
              className="block text-sm font-medium text-gray-700"
            >
              Categoría
            </label>
            <select
              name="category_id"
              id="category_id"
              value={formData.category_id}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="image_url"
              className="block text-sm font-medium text-gray-700"
            >
              Imagen del Plato
            </label>
            <div className="mt-1 flex items-center space-x-4">
              {imageUrl && ( // <-- Usar el estado separado de la URL
                <Image
                  src={imageUrl} // <-- Usar el estado separado de la URL
                  alt="Current"
                  width={64}
                  height={64}
                  className="w-16 h-16 object-cover rounded-md"
                />
              )}
              <input
                type="file"
                onChange={handleFileChange}
                accept="image/*"
                disabled={isUploading}
                className="block text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            {isUploading && (
              <p className="text-sm text-blue-500 mt-2">Uploading...</p>
            )}
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || isUploading}
              className="px-4 py-2 rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
            >
              {isSaving
                ? "Guardando..."
                : itemToEdit
                ? "Actualizar Plato"
                : "Agregar Plato"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
