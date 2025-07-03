// src/components/MenuItemForm.tsx
"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

// Type definitions
type Category = { id: number; name: string };
type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  category_id: number | null;
  image_url: string | null;
};
interface MenuItemFormProps {
  categories: Category[];
  itemToEdit?: MenuItem | null;
  onComplete: () => void;
  onCancelEdit: () => void;
}

export default function MenuItemForm({
  categories,
  itemToEdit,
  onComplete,
  onCancelEdit,
}: MenuItemFormProps) {
  const supabase = createClient();

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [formMessage, setFormMessage] = useState<string | null>(null);

  const isEditMode = Boolean(itemToEdit);

  useEffect(() => {
    if (itemToEdit) {
      setName(itemToEdit.name);
      setDescription(itemToEdit.description || "");
      setPrice(itemToEdit.price?.toString() || "");
      setCategoryId(itemToEdit.category_id || "");
      setImageFile(null); // Reset file input when editing a new item
    } else {
      setName("");
      setDescription("");
      setPrice("");
      setCategoryId(categories[0]?.id || "");
      setImageFile(null);
    }
  }, [itemToEdit, categories]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setFormMessage(null);

    let imageUrl = itemToEdit?.image_url || null;

    if (imageFile) {
      const fileName = `${Date.now()}-${imageFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("menu-images")
        .upload(fileName, imageFile);

      if (uploadError) {
        setFormMessage(`Error uploading image: ${uploadError.message}`);
        setIsLoading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("menu-images")
        .getPublicUrl(uploadData.path);

      imageUrl = urlData.publicUrl;
    }

    const itemData = {
      name,
      description,
      price: parseFloat(price),
      category_id: categoryId,
      image_url: imageUrl,
    };

    let dbError;
    if (isEditMode) {
      const { error } = await supabase
        .from("menu_items")
        .update(itemData)
        .eq("id", itemToEdit!.id);
      dbError = error;
    } else {
      const { error } = await supabase.from("menu_items").insert(itemData);
      dbError = error;
    }

    if (dbError) {
      setFormMessage(`Error saving item: ${dbError.message}`);
    } else {
      onComplete();
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
      {/* --- ALL FORM FIELDS --- */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Item Name
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <div>
        <label
          htmlFor="price"
          className="block text-sm font-medium text-gray-700"
        >
          Price
        </label>
        <input
          type="number"
          id="price"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        />
      </div>
      <div>
        <label
          htmlFor="category"
          className="block text-sm font-medium text-gray-700"
        >
          Category
        </label>
        <select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(Number(e.target.value))}
          required
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
        >
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="image"
          className="block text-sm font-medium text-gray-700"
        >
          Item Image
        </label>
        <input
          type="file"
          id="image"
          accept="image/png, image/jpeg, image/webp"
          onChange={(e) => {
            if (e.target.files && e.target.files.length > 0) {
              setImageFile(e.target.files[0]);
            }
          }}
          className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
        />
        {itemToEdit?.image_url && !imageFile && (
          <p className="text-xs text-gray-500 mt-1">
            Currently using existing image. Choose a new file to replace it.
          </p>
        )}
      </div>
      {/* --- END FORM FIELDS --- */}

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={isLoading}
          className="flex-grow justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
        >
          {isLoading
            ? "Saving..."
            : isEditMode
            ? "Update Menu Item"
            : "Add Menu Item"}
        </button>
        {isEditMode && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel Edit
          </button>
        )}
      </div>
      {formMessage && (
        <p
          className={`mt-2 text-sm text-center ${
            formMessage.startsWith("Error") ? "text-red-600" : "text-green-600"
          }`}
        >
          {formMessage}
        </p>
      )}
    </form>
  );
}
