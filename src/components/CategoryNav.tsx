"use client";

import { useEffect, useRef } from "react";

interface Category {
  id: number;
  name: string;
}

interface CategoryNavProps {
  activeCategoryId: number | null;
  onCategorySelect: (id: number) => void;
  categories: Category[];
  isHeaderScrolled?: boolean;
}

export default function CategoryNav({
  categories,
  activeCategoryId,
  onCategorySelect,
  isHeaderScrolled = false,
}: CategoryNavProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const activeButtonRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll para centrar la categoría activa
  useEffect(() => {
    if (activeCategoryId && activeButtonRef.current && navRef.current) {
      const activeButton = activeButtonRef.current;
      const nav = navRef.current;
      
      // Usar un pequeño delay para asegurar que el DOM esté actualizado
      const scrollToActive = () => {
        const buttonCenter = activeButton.offsetLeft + (activeButton.offsetWidth / 2);
        const navCenter = nav.offsetWidth / 2;
        const scrollPosition = Math.max(0, buttonCenter - navCenter);
        
        nav.scrollTo({
          left: scrollPosition,
          behavior: 'smooth'
        });
      };
      
      // Ejecutar inmediatamente y también con un pequeño delay
      scrollToActive();
      setTimeout(scrollToActive, 50);
    }
  }, [activeCategoryId]);
  
  return (
    <nav className="sticky top-0 z-30 bg-white shadow-sm border-t border-gray-100">
      <div 
        ref={navRef}
        className="overflow-x-auto whitespace-nowrap px-4 flex scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {categories.map((category) => (
          <button
            key={category.id}
            ref={activeCategoryId === category.id ? activeButtonRef : null}
            onClick={() => onCategorySelect(category.id)}
            className={`py-3 px-4 text-base font-medium transition-colors duration-200 border-b-2 whitespace-nowrap ${
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
