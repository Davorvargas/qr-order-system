"use client";

interface Category {
  id: number;
  name: string;
}

interface CategoryNavProps {
  activeCategoryId: number | null;
  onCategorySelect: (id: number) => void;
  categories: Category[];
}

export default function CategoryNav({
  categories,
  activeCategoryId,
  onCategorySelect,
}: CategoryNavProps) {
  return (
    <nav className="sticky top-0 z-30 bg-white shadow-sm">
      <div className="overflow-x-auto whitespace-nowrap px-4 flex">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`py-3 px-4 text-base font-medium transition-colors duration-200 border-b-2 ${
              activeCategoryId === category.id
                ? "border-black text-black"
                : "border-transparent text-gray-500 hover:text-black"
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
    </nav>
  );
}
