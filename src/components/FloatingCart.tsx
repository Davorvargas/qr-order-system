"use client";

import { useMemo } from "react";

// Re-using the OrderState interface from OrderForm.tsx
interface OrderItemDetail {
  quantity: number;
  name: string;
  price: number | null;
  notes: string;
}
interface OrderState {
  [itemId: number]: OrderItemDetail;
}

interface FloatingCartProps {
  orderItems: OrderState;
  onClick: () => void;
}

export default function FloatingCart({
  orderItems,
  onClick,
}: FloatingCartProps) {
  const { totalItems, totalPrice } = useMemo(() => {
    const items = Object.values(orderItems);
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce(
      (sum, item) => sum + (item.price ?? 0) * item.quantity,
      0
    );
    return { totalItems, totalPrice };
  }, [orderItems]);

  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="floating-cart fixed bottom-0 left-0 right-0 p-4 bg-transparent flex justify-center z-40 pointer-events-none">
      <div className="w-full max-w-md pointer-events-auto">
        <button
          onClick={onClick}
          className="bg-black text-white font-bold py-3 px-6 rounded-full w-full shadow-lg flex justify-between items-center transform hover:scale-105 transition-transform"
        >
          <span className="text-white font-bold">Ver tu pedido</span>
          <div className="flex items-center space-x-3">
            <span className="font-bold text-white">Bs {totalPrice.toFixed(2)}</span>
            <span className="bg-white text-black rounded-full h-7 w-7 flex items-center justify-center text-sm font-bold">
              {totalItems}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
