"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import DeliveryReceiptModal from "@/components/DeliveryReceiptModal";
import MenuItemDetailModal from "@/components/MenuItemDetailModal";
import {
  Plus,
  Minus,
  ShoppingCart,
  Clock,
  MapPin,
  Phone,
  User,
  CreditCard,
  Calendar,
  Check,
  X,
} from "lucide-react";

interface MenuItem {
  id: number;
  name: string;
  description: string | null;
  price: number;
  is_available: boolean;
  image_url?: string;
}

interface CartItem extends MenuItem {
  quantity: number;
  notes: string;
}

interface DeliverySettings {
  restaurant_id: string;
  restaurant_name: string;
  theme_color: string;
  logo_url?: string;
  background_images?: string[];
  primary_color?: string;
  secondary_color?: string;
}

export default function DeliveryMenuPage() {
  const params = useParams();
  const linkId = params.linkId as string;

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [deliverySettings, setDeliverySettings] =
    useState<DeliverySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);

  const [customerInfo, setCustomerInfo] = useState({
    customer_name: "",
    customer_phone: "",
    customer_address: "",
    delivery_date: "",
    delivery_time: "",
    customer_nit_carnet: "",
    customer_razon_social: "",
  });

  const [generalNotes, setGeneralNotes] = useState("");
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<
    "cart" | "details" | "confirmation"
  >("cart");

  const supabase = createClient();

  useEffect(() => {
    if (linkId) {
      loadDeliveryMenu();
    }
  }, [linkId]);

  // Scroll effect for sticky header
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const shouldBeScrolled = scrollTop > 50;

      if (shouldBeScrolled !== isHeaderScrolled) {
        setIsHeaderScrolled(shouldBeScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHeaderScrolled]);

  const loadDeliveryMenu = async () => {
    try {
      setLoading(true);

      // Get delivery settings by link ID with full restaurant info
      const { data: settings } = await supabase
        .from("restaurant_delivery_settings")
        .select(
          `
          restaurant_id,
          theme_color,
          restaurants!inner(name, logo_url, background_images, primary_color, secondary_color)
        `
        )
        .eq("delivery_link_id", linkId)
        .eq("delivery_enabled", true)
        .single();

      if (!settings) {
        throw new Error("Link de delivery no válido o deshabilitado");
      }

      const restaurant = settings.restaurants as any;

      // Use restaurant-specific colors or fallback to delivery theme_color
      const primaryColor =
        restaurant?.primary_color || settings.theme_color || "#1e40af";
      const secondaryColor = restaurant?.secondary_color || "#fbbf24";

      // Special case: Use pink for Rosse Coffee, otherwise use restaurant colors
      const finalPrimaryColor =
        restaurant?.name === "Rosse Coffee" ? "#ec4899" : primaryColor;

      setDeliverySettings({
        restaurant_id: settings.restaurant_id,
        restaurant_name: restaurant?.name || "Restaurante",
        theme_color: settings.theme_color,
        logo_url: restaurant?.logo_url,
        background_images: restaurant?.background_images || [],
        primary_color: finalPrimaryColor,
        secondary_color: secondaryColor,
      });

      // Load menu items available for delivery
      const { data: items } = await supabase
        .from("menu_items")
        .select("id, name, description, price, is_available, image_url")
        .eq("restaurant_id", settings.restaurant_id)
        .in("menu_type", ["delivery", "both"])
        .eq("is_available", true)
        .order("name");

      setMenuItems(items || []);
    } catch (error) {
      console.error("Error loading delivery menu:", error);
      alert(
        "Error al cargar el menú de delivery. Verifica que el link sea válido."
      );
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existingItem = prev.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1, notes: "" }];
    });
  };

  const removeFromCart = (itemId: number) => {
    setCart((prev) => {
      const existingItem = prev.find((cartItem) => cartItem.id === itemId);
      if (existingItem && existingItem.quantity > 1) {
        return prev.map((cartItem) =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem
        );
      }
      return prev.filter((cartItem) => cartItem.id !== itemId);
    });
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleReceiptClose = () => {
    setShowReceiptModal(false);
    setCompletedOrder(null);
    // Reset form
    setCart([]);
    setGeneralNotes("");
    setCustomerInfo({
      customer_name: "",
      customer_phone: "",
      customer_address: "",
      delivery_date: "",
      delivery_time: "",
      customer_nit_carnet: "",
      customer_razon_social: "",
    });
  };

  const getCartQuantity = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const updateItemNotes = (itemId: number, notes: string) => {
    setCart((prev) =>
      prev.map((cartItem) =>
        cartItem.id === itemId ? { ...cartItem, notes } : cartItem
      )
    );
  };

  const updateItemQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      setCart((prev) => prev.filter((cartItem) => cartItem.id !== itemId));
    } else {
      setCart((prev) =>
        prev.map((cartItem) =>
          cartItem.id === itemId
            ? { ...cartItem, quantity: newQuantity }
            : cartItem
        )
      );
    }
  };

  const handleItemClick = (item: MenuItem) => {
    setSelectedItem(item);
  };

  const handleAddFromModal = (
    item: MenuItem,
    quantity: number,
    notes: string
  ) => {
    setCart((prev) => {
      const existingItem = prev.find((cartItem) => cartItem.id === item.id);
      if (existingItem) {
        return prev.map((cartItem) =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + quantity,
                notes: notes || cartItem.notes,
              }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity, notes: notes || "" }];
    });
  };

  const handleSubmitOrder = async () => {
    if (!deliverySettings || cart.length === 0) return;

    // Validate required fields
    if (
      !customerInfo.customer_name ||
      !customerInfo.customer_phone ||
      !customerInfo.customer_address ||
      !customerInfo.delivery_date ||
      !customerInfo.delivery_time
    ) {
      alert("Por favor completa todos los campos obligatorios.");
      return;
    }

    try {
      setSubmittingOrder(true);

      // Create order with delivery information
      const orderData = {
        customer_name: customerInfo.customer_name,
        restaurant_id: deliverySettings.restaurant_id,
        source: "delivery_web",
        order_type: "delivery",
        customer_phone: customerInfo.customer_phone,
        customer_address: customerInfo.customer_address,
        delivery_date: customerInfo.delivery_date,
        delivery_time: customerInfo.delivery_time,
        customer_nit_carnet: customerInfo.customer_nit_carnet || null,
        customer_razon_social: customerInfo.customer_razon_social || null,
        total_price: getCartTotal(),
        notes: generalNotes.trim() || null,
        status: "pending",
      };

      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        price_at_order: item.price,
        notes: item.notes.trim() || null,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Success - Show receipt modal instead of alert
      const receiptOrderData = {
        id: order.id,
        customer_name: customerInfo.customer_name,
        customer_phone: customerInfo.customer_phone,
        customer_address: customerInfo.customer_address,
        delivery_date: customerInfo.delivery_date,
        delivery_time: customerInfo.delivery_time,
        customer_nit_carnet: customerInfo.customer_nit_carnet,
        customer_razon_social: customerInfo.customer_razon_social,
        total_price: getCartTotal(),
        created_at: new Date().toISOString(),
      };

      const orderItemsData = cart.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      }));

      setCompletedOrder({
        orderData: receiptOrderData,
        orderItems: orderItemsData,
      });
      setShowReceiptModal(true);
      setShowCheckout(false);
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Error al enviar el pedido. Inténtalo de nuevo.");
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-16 w-16 border-b-2 mx-auto"
            style={{
              borderColor: deliverySettings?.primary_color || "#1e40af",
            }}
          ></div>
          <p className="mt-4 text-lg text-gray-700">
            Cargando menú de delivery...
          </p>
        </div>
      </div>
    );
  }

  if (!deliverySettings) {
    return (
      <div className="min-h-screen bg-red-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-800 mb-4">
            Link no válido
          </h1>
          <p className="text-red-600">
            Este link de delivery no existe o está deshabilitado.
          </p>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  // Use the restaurant-specific colors that were already loaded
  const primaryColor = deliverySettings.primary_color || "#1e40af";
  const secondaryColor = deliverySettings.secondary_color || "#fbbf24";

  // Default Senderos images as fallback
  const defaultBackgroundImage = "/images/background-senderos.jpeg?v=1";
  const defaultLogoImage = "/images/logo-senderos.jpg?v=1";

  const backgroundImage =
    deliverySettings.background_images?.[0] || defaultBackgroundImage;
  const logoImage = deliverySettings.logo_url || defaultLogoImage;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      {isHeaderScrolled ? (
        // Header contraído - logo centrado con fondo del tema
        <div
          className="fixed top-0 left-0 right-0 z-50 h-16 shadow-lg transition-all duration-300"
          style={{ backgroundColor: primaryColor }}
        >
          <div className="flex items-center justify-center h-full px-2">
            <div className="w-14 h-14 rounded-full shadow-lg overflow-hidden">
              <img
                src={logoImage}
                alt={`${deliverySettings.restaurant_name} Logo`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const current = e.currentTarget as HTMLImageElement;
                  const next = current.nextElementSibling as HTMLElement;
                  current.style.display = "none";
                  next.style.display = "flex";
                }}
              />
              {/* Fallback colored circle */}
              <div
                className="w-full h-full flex items-center justify-center text-white font-bold text-sm hidden"
                style={{ backgroundColor: primaryColor }}
              >
                {deliverySettings.restaurant_name.charAt(0)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Header expandido - imagen de fondo + logo + info
        <div
          className="fixed top-0 left-0 right-0 z-50 h-40 bg-cover bg-center shadow-lg transition-all duration-300"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundColor: primaryColor, // fallback color
          }}
        >
          {/* Overlay for better text readability */}
          <div className="absolute inset-0 bg-black/30"></div>

          {/* Header Content */}
          <div className="relative h-full flex flex-col items-center justify-center text-white px-6">
            {/* Restaurant Logo - Bigger size */}
            <div className="w-24 h-24 rounded-full shadow-lg overflow-hidden mb-3 border-2 border-white">
              <img
                src={logoImage}
                alt={`${deliverySettings.restaurant_name} Logo`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to a colored circle with restaurant initial
                  const current = e.currentTarget as HTMLImageElement;
                  const next = current.nextElementSibling as HTMLElement;
                  current.style.display = "none";
                  next.style.display = "flex";
                }}
              />
              {/* Fallback colored circle */}
              <div
                className="w-full h-full flex items-center justify-center text-white font-bold text-xl hidden"
                style={{ backgroundColor: primaryColor }}
              >
                {deliverySettings.restaurant_name.charAt(0)}
              </div>
            </div>

            {/* Delivery Badge */}
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
              <MapPin size={14} />
              <span className="text-sm font-medium">Menú de Delivery</span>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div
        className="max-w-2xl mx-auto p-4 sm:p-6 transition-all duration-300"
        style={{ paddingTop: isHeaderScrolled ? "80px" : "180px" }}
      >
        {!showCheckout ? (
          <>
            {/* Menu Items */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Nuestro Menú ({menuItems.length} productos disponibles)
              </h2>

              {menuItems.map((item) => {
                const cartItem = cart.find((c) => c.id === item.id);
                return (
                  <div
                    key={item.id}
                    className="bg-pink-50 rounded-lg shadow-md overflow-hidden border border-pink-100"
                  >
                    {/* Clickeable item content */}
                    <div
                      onClick={() => handleItemClick(item)}
                      className="p-6 cursor-pointer hover:bg-pink-100 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {item.name}
                          </h3>
                          {item.description && (
                            <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                          <p
                            className="text-2xl font-bold mt-3"
                            style={{ color: primaryColor }}
                          >
                            Bs. {item.price?.toFixed(2)}
                          </p>
                        </div>

                        {/* Right side: Image and Add button */}
                        <div className="flex items-center gap-4 ml-4">
                          {/* Image if available */}
                          {item.image_url && (
                            <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={item.image_url}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}

                          {/* Add/Quantity controls - only show if no image or item is in cart */}
                          {(!item.image_url || cartItem) && (
                            <div className="flex items-center gap-2">
                              {cartItem ? (
                                <>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeFromCart(item.id);
                                    }}
                                    className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors"
                                  >
                                    <Minus size={14} />
                                  </button>
                                  <span className="font-semibold text-lg w-8 text-center">
                                    {cartItem.quantity}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      addToCart(item);
                                    }}
                                    className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                                    style={{ backgroundColor: primaryColor }}
                                  >
                                    <Plus size={14} />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    addToCart(item);
                                  }}
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-white hover:opacity-90 transition-opacity"
                                  style={{ backgroundColor: primaryColor }}
                                >
                                  <Plus size={16} />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          // Multi-step Checkout
          <div className="bg-white rounded-lg shadow-lg p-6">
            {/* Progress indicator */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-4">
                <div
                  className={`flex items-center ${
                    checkoutStep === "cart"
                      ? "text-blue-600"
                      : checkoutStep === "details" ||
                        checkoutStep === "confirmation"
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      checkoutStep === "cart"
                        ? "bg-blue-600 text-white"
                        : checkoutStep === "details" ||
                          checkoutStep === "confirmation"
                        ? "bg-green-600 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    1
                  </div>
                  <span className="ml-2 text-sm font-medium">Carrito</span>
                </div>
                <div
                  className={`w-8 h-0.5 ${
                    checkoutStep === "details" ||
                    checkoutStep === "confirmation"
                      ? "bg-green-600"
                      : "bg-gray-300"
                  }`}
                ></div>
                <div
                  className={`flex items-center ${
                    checkoutStep === "details"
                      ? "text-blue-600"
                      : checkoutStep === "confirmation"
                      ? "text-green-600"
                      : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      checkoutStep === "details"
                        ? "bg-blue-600 text-white"
                        : checkoutStep === "confirmation"
                        ? "bg-green-600 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    2
                  </div>
                  <span className="ml-2 text-sm font-medium">Entrega</span>
                </div>
                <div
                  className={`w-8 h-0.5 ${
                    checkoutStep === "confirmation"
                      ? "bg-green-600"
                      : "bg-gray-300"
                  }`}
                ></div>
                <div
                  className={`flex items-center ${
                    checkoutStep === "confirmation"
                      ? "text-blue-600"
                      : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      checkoutStep === "confirmation"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    3
                  </div>
                  <span className="ml-2 text-sm font-medium">Confirmar</span>
                </div>
              </div>
            </div>

            {checkoutStep === "cart" && (
              <>
                <h2
                  className="text-2xl font-bold mb-6"
                  style={{ color: primaryColor }}
                >
                  Revisión del Carrito
                </h2>

                {/* Cart Items */}
                <div className="space-y-4 mb-6">
                  {cart.map((item) => (
                    <div key={item.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateItemQuantity(item.id, item.quantity - 1)
                              }
                              className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 text-sm"
                            >
                              -
                            </button>
                            <span className="w-8 text-center font-medium">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateItemQuantity(item.id, item.quantity + 1)
                              }
                              className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 text-sm text-white"
                              style={{ backgroundColor: primaryColor }}
                            >
                              +
                            </button>
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {item.name}
                            </h3>
                            <p className="text-sm text-gray-600">
                              Bs. {item.price.toFixed(2)} c/u
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">
                            Bs. {(item.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Item notes */}
                      <div className="mt-3">
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) =>
                            updateItemNotes(item.id, e.target.value)
                          }
                          placeholder="Comentarios para este producto..."
                          className="w-full px-3 py-2 text-sm border border-pink-200 bg-pink-50 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 placeholder-pink-400"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* General Notes */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comentarios generales del pedido
                  </label>
                  <textarea
                    value={generalNotes}
                    onChange={(e) => setGeneralNotes(e.target.value)}
                    placeholder="Comentarios adicionales para todo el pedido..."
                    className="w-full px-3 py-2 text-sm border border-pink-200 bg-pink-50 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 placeholder-pink-400 h-20"
                  />
                </div>

                {/* Total */}
                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">Total:</span>
                    <span
                      className="text-2xl font-bold"
                      style={{ color: primaryColor }}
                    >
                      Bs. {getCartTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Navigation buttons */}
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowCheckout(false)}
                    className="flex-1 py-3 px-6 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Volver al menú
                  </button>
                  <button
                    onClick={() => setCheckoutStep("details")}
                    disabled={cart.length === 0}
                    className="flex-1 py-3 px-6 rounded-lg font-semibold text-white hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Continuar
                  </button>
                </div>
              </>
            )}

            {checkoutStep === "details" && (
              <>
                <h2
                  className="text-2xl font-bold mb-6"
                  style={{ color: primaryColor }}
                >
                  Información de Entrega
                </h2>

                <div className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <User size={16} className="inline mr-2" />
                        Nombre completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerInfo.customer_name}
                        onChange={(e) =>
                          setCustomerInfo((prev) => ({
                            ...prev,
                            customer_name: e.target.value,
                          }))
                        }
                        className="w-full border border-pink-200 bg-pink-50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-300 focus:border-pink-400 placeholder-pink-400"
                        placeholder="Tu nombre completo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Phone size={16} className="inline mr-2" />
                        Teléfono *
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerInfo.customer_phone}
                        onChange={(e) =>
                          setCustomerInfo((prev) => ({
                            ...prev,
                            customer_phone: e.target.value,
                          }))
                        }
                        className="w-full border border-pink-200 bg-pink-50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-300 focus:border-pink-400 placeholder-pink-400"
                        placeholder="Tu número de teléfono"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <MapPin size={16} className="inline mr-2" />
                        Dirección de entrega *
                      </label>
                      <textarea
                        required
                        value={customerInfo.customer_address}
                        onChange={(e) =>
                          setCustomerInfo((prev) => ({
                            ...prev,
                            customer_address: e.target.value,
                          }))
                        }
                        className="w-full border border-pink-200 bg-pink-50 rounded-lg px-4 py-3 h-24 focus:ring-2 focus:ring-pink-300 focus:border-pink-400 placeholder-pink-400"
                        placeholder="Dirección completa para la entrega"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Calendar size={16} className="inline mr-2" />
                          Fecha de entrega *
                        </label>
                        <input
                          type="date"
                          required
                          min={today}
                          value={customerInfo.delivery_date}
                          onChange={(e) =>
                            setCustomerInfo((prev) => ({
                              ...prev,
                              delivery_date: e.target.value,
                            }))
                          }
                          className="w-full border border-pink-200 bg-pink-50 rounded-lg px-4 py-4 text-base focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <Clock size={16} className="inline mr-2" />
                          Hora de entrega *
                        </label>
                        <input
                          type="time"
                          required
                          value={customerInfo.delivery_time}
                          onChange={(e) =>
                            setCustomerInfo((prev) => ({
                              ...prev,
                              delivery_time: e.target.value,
                            }))
                          }
                          className="w-full border border-pink-200 bg-pink-50 rounded-lg px-4 py-4 text-base focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <CreditCard size={16} className="inline mr-2" />
                        NIT o Carnet (opcional)
                      </label>
                      <input
                        type="text"
                        value={customerInfo.customer_nit_carnet}
                        onChange={(e) =>
                          setCustomerInfo((prev) => ({
                            ...prev,
                            customer_nit_carnet: e.target.value,
                          }))
                        }
                        className="w-full border border-pink-200 bg-pink-50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-300 focus:border-pink-400 placeholder-pink-400"
                        placeholder="NIT o número de carnet"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Razón Social (opcional)
                      </label>
                      <input
                        type="text"
                        value={customerInfo.customer_razon_social}
                        onChange={(e) =>
                          setCustomerInfo((prev) => ({
                            ...prev,
                            customer_razon_social: e.target.value,
                          }))
                        }
                        className="w-full border border-pink-200 bg-pink-50 rounded-lg px-4 py-3 focus:ring-2 focus:ring-pink-300 focus:border-pink-400 placeholder-pink-400"
                        placeholder="Solo si proporcionaste NIT"
                      />
                    </div>
                  </div>

                  {/* Quick order summary - moved to bottom and centered */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-3 text-center">
                      Resumen del pedido
                    </h3>
                    <div className="space-y-2">
                      {cart.map((item) => (
                        <div
                          key={item.id}
                          className="flex justify-between text-sm"
                        >
                          <span>
                            {item.quantity}x {item.name}
                          </span>
                          <span>
                            Bs. {(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-bold">
                          <span>Total:</span>
                          <span style={{ color: primaryColor }}>
                            Bs. {getCartTotal().toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Navigation buttons */}
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setCheckoutStep("cart")}
                    className="flex-1 py-3 px-6 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Volver al carrito
                  </button>
                  <button
                    onClick={() => setCheckoutStep("confirmation")}
                    disabled={
                      !customerInfo.customer_name ||
                      !customerInfo.customer_phone ||
                      !customerInfo.customer_address ||
                      !customerInfo.delivery_date ||
                      !customerInfo.delivery_time
                    }
                    className="flex-1 py-3 px-6 rounded-lg font-semibold text-white hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Revisar pedido
                  </button>
                </div>
              </>
            )}

            {checkoutStep === "confirmation" && (
              <>
                <h2
                  className="text-2xl font-bold mb-6"
                  style={{ color: primaryColor }}
                >
                  Confirmar Pedido
                </h2>

                {/* Final review */}
                <div className="space-y-6">
                  {/* Order details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 text-center">
                      Detalles del pedido
                    </h3>

                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-3">
                        {cart.map((item) => (
                          <div
                            key={item.id}
                            className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <div>
                                <span className="font-medium">
                                  {item.quantity}x {item.name}
                                </span>
                                <p className="text-sm text-gray-600">
                                  Bs. {item.price.toFixed(2)} c/u
                                </p>
                              </div>
                              <span className="font-semibold">
                                Bs. {(item.price * item.quantity).toFixed(2)}
                              </span>
                            </div>
                            {item.notes && (
                              <p className="text-xs text-gray-600 italic">
                                Nota: {item.notes}
                              </p>
                            )}
                          </div>
                        ))}

                        {generalNotes && (
                          <div className="pt-3 border-t border-gray-200">
                            <p className="text-sm font-medium text-gray-700">
                              Comentarios generales:
                            </p>
                            <p className="text-sm text-gray-600 italic">
                              {generalNotes}
                            </p>
                          </div>
                        )}

                        <div className="border-t border-gray-300 pt-3 mt-3">
                          <div className="flex justify-between font-bold text-lg">
                            <span>Total:</span>
                            <span style={{ color: primaryColor }}>
                              Bs. {getCartTotal().toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 text-center">
                      Información de entrega
                    </h3>

                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Nombre:
                        </p>
                        <p className="text-sm text-gray-900">
                          {customerInfo.customer_name}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Teléfono:
                        </p>
                        <p className="text-sm text-gray-900">
                          {customerInfo.customer_phone}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Dirección:
                        </p>
                        <p className="text-sm text-gray-900">
                          {customerInfo.customer_address}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          Fecha y hora:
                        </p>
                        <p className="text-sm text-gray-900">
                          {customerInfo.delivery_date} a las{" "}
                          {customerInfo.delivery_time}
                        </p>
                      </div>

                      {customerInfo.customer_nit_carnet && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">
                            NIT/Carnet:
                          </p>
                          <p className="text-sm text-gray-900">
                            {customerInfo.customer_nit_carnet}
                          </p>
                          {customerInfo.customer_razon_social && (
                            <>
                              <p className="text-sm font-medium text-gray-700 mt-1">
                                Razón Social:
                              </p>
                              <p className="text-sm text-gray-900">
                                {customerInfo.customer_razon_social}
                              </p>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Final navigation buttons */}
                <div className="flex gap-4 mt-8">
                  <button
                    onClick={() => setCheckoutStep("details")}
                    className="flex-1 py-3 px-6 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50"
                  >
                    Modificar información
                  </button>
                  <button
                    onClick={handleSubmitOrder}
                    disabled={submittingOrder || cart.length === 0}
                    className="flex-1 py-3 px-6 rounded-lg font-semibold text-white hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {submittingOrder
                      ? "Enviando..."
                      : `Confirmar Pedido (Bs. ${getCartTotal().toFixed(2)})`}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && !showCheckout && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <button
            onClick={() => {
              setCheckoutStep("cart");
              setShowCheckout(true);
            }}
            className="rounded-full px-6 py-4 text-white shadow-2xl hover:opacity-90 flex items-center gap-3 text-lg font-semibold"
            style={{ backgroundColor: primaryColor }}
          >
            <ShoppingCart size={24} />
            <span>
              {getCartQuantity()} items - ${getCartTotal().toFixed(2)}
            </span>
          </button>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <MenuItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onAddToCart={handleAddFromModal}
          primaryColor={primaryColor}
        />
      )}

      {/* Delivery Receipt Modal */}
      {showReceiptModal && completedOrder && deliverySettings && (
        <DeliveryReceiptModal
          isOpen={showReceiptModal}
          onClose={handleReceiptClose}
          orderData={completedOrder.orderData}
          orderItems={completedOrder.orderItems}
          restaurantInfo={{
            name: deliverySettings.restaurant_name || "Restaurante",
            logo_url: undefined,
            primary_color: deliverySettings.theme_color,
          }}
        />
      )}
    </div>
  );
}
