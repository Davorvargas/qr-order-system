"use client";

import { useMemo } from "react";

// Re-using the OrderState interface from OrderForm.tsx
interface OrderItemDetail {
  quantity: number;
  name: string;
  price: number | null;
  notes: string;
  isCustom?: boolean;
  originalItemId?: number;
  selectedModifiers?: Record<string, string[]>;
  modifierDetails?: string;
}
interface OrderState {
  [itemId: string]: OrderItemDetail;
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
    const items = Object.values(orderItems).filter(item => item.quantity > 0);
    
    const totalItems = items.reduce((sum, item) => {
      const quantity = Number(item.quantity) || 0; // Force to number
      return sum + quantity;
    }, 0);
    
    const totalPrice = items.reduce(
      (sum, item) => {
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        return sum + price * quantity;
      },
      0
    );
    
    return { totalItems, totalPrice };
  }, [orderItems]);

  if (totalItems === 0) {
    return null;
  }

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '0px', 
      left: '0px', 
      right: '0px', 
      padding: '16px',
      zIndex: 40,
      display: 'flex',
      justifyContent: 'center',
      pointerEvents: 'none'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '448px', // max-w-md equivalent
        pointerEvents: 'auto'
      }}>
        <button 
          onClick={onClick}
          style={{
            backgroundColor: 'rgb(0, 0, 0)',
            color: 'white',
            fontWeight: '900',
            padding: '12px 24px',
            borderRadius: '9999px',
            width: '100%',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            transform: 'scale(1)',
            transition: 'transform 0.2s',
            border: '2px solid white',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <span style={{
            color: 'rgb(255, 255, 255)',
            fontWeight: '900',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
          }}>
            Ver tu pedido
          </span>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{
              color: 'rgb(255, 255, 255)',
              fontWeight: '900',
              textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)'
            }}>
              Bs {totalPrice.toFixed(2)}
            </span>
            
            <span style={{
              backgroundColor: 'rgb(255, 255, 255)',
              color: 'rgb(0, 0, 0)',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '14px',
              fontWeight: '900',
              border: '2px solid black',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
            }}>
              {isNaN(totalItems) ? '?' : totalItems}
            </span>
          </div>
        </button>
      </div>
    </div>
  );
}
