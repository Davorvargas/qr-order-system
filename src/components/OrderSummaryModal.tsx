"use client";

// --- INTERFACES ---
interface OrderItemDetail {
  quantity: number;
  name: string;
  price: number | null;
  notes?: string; // Added notes to the interface
}
interface OrderState {
  [itemId: number]: OrderItemDetail;
}

interface OrderSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderItems: OrderState;
  totalPrice: number;
  customerName: string;
  setCustomerName: (name: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  onUpdateQuantity: (itemId: number, newQuantity: number) => void;
  onRemoveItem: (itemId: number) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path
      fillRule="evenodd"
      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z"
      clipRule="evenodd"
    />
  </svg>
);

export default function OrderSummaryModal({
  isOpen,
  onClose,
  orderItems,
  totalPrice,
  customerName,
  setCustomerName,
  notes,
  setNotes,
  onUpdateQuantity,
  onRemoveItem,
  onSubmit,
  isLoading,
}: OrderSummaryModalProps) {
  if (!isOpen) return null;

  const itemEntries = Object.entries(orderItems);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-bold">Tu Pedido</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
          >
            &times;
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          {/* Customer Name */}
          <div>
            <label
              htmlFor="customerName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tu Nombre *
            </label>
            <input
              type="text"
              id="customerName"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Por favor, ingresa tu nombre"
              required
              className="w-full p-2 border rounded-md"
            />
          </div>

          {/* Order Items */}
          <ul className="space-y-3">
            {itemEntries.map(([itemId, itemDetail]) => {
              const id = parseInt(itemId, 10);
              return (
                <li key={id} className="flex items-center justify-between">
                  <div className="flex-grow">
                    <p className="font-semibold">{itemDetail.name}</p>
                    {itemDetail.notes && itemDetail.notes.trim() !== "" && (
                      <p className="text-xs text-gray-500 mt-1 ml-1 whitespace-pre-wrap">
                        &#x1F4AC; {itemDetail.notes}
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      Bs {(itemDetail.price ?? 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() =>
                        onUpdateQuantity(id, itemDetail.quantity - 1)
                      }
                      className="border rounded-full w-7 h-7 flex items-center justify-center font-bold text-lg"
                    >
                      -
                    </button>
                    <span className="w-4 text-center">
                      {itemDetail.quantity}
                    </span>
                    <button
                      onClick={() =>
                        onUpdateQuantity(id, itemDetail.quantity + 1)
                      }
                      className="border rounded-full w-7 h-7 flex items-center justify-center font-bold text-lg"
                    >
                      +
                    </button>
                    <button
                      onClick={() => onRemoveItem(id)}
                      className="text-red-500 hover:text-red-700 ml-2"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Order Notes */}
          <div>
            <label
              htmlFor="orderNotes"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Notas del Pedido (opcional)
            </label>
            <textarea
              id="orderNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Información de alergias, servilletas extra..."
              rows={3}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>

        <div className="p-4 border-t mt-auto">
          <div className="flex justify-between font-bold text-lg mb-4">
            <span>Total:</span>
            <span>Bs {totalPrice.toFixed(2)}</span>
          </div>
          <button
            onClick={onSubmit}
            disabled={
              isLoading || itemEntries.length === 0 || !customerName.trim()
            }
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
          >
            {isLoading ? "Realizando Pedido..." : "Realizar Pedido"}
          </button>
        </div>
      </div>
    </div>
  );
}
