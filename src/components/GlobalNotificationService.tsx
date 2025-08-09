"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/lib/database.types";

type Order = Database["public"]["Tables"]["orders"]["Row"] & {
  table?: { table_number?: string };
  order_items?: any[];
};
type Printer = Database["public"]["Tables"]["printers"]["Row"];

// Singleton para prevenir múltiples instancias - resetear en desarrollo
let globalNotificationInstance: any = null;
let isInitialized = false;

// Global guard on window to avoid cross-chunk duplicates and allow re-init if needed
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const win: any = typeof window !== "undefined" ? window : {};
win.__GNS = win.__GNS || { initialized: false, status: "INIT", channel: null };

// Resetear el singleton en desarrollo cuando hay hot reload
if (typeof window !== "undefined" && process.env.NODE_ENV === "development") {
  // Escuchar eventos de hot reload
  if (typeof window.addEventListener === "function") {
    window.addEventListener("beforeunload", () => {
      isInitialized = false;
      globalNotificationInstance = null;
    });
  }
}
let isPlayingSound = false; // Flag para prevenir sonidos simultáneos
let audioContext: AudioContext | null = null; // Audio context global

// Enhanced Audio notification hook with different sound types
const useAudioNotification = () => {
  const initializeAudioContext = () => {
    if (!audioContext) {
      try {
        audioContext = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
        console.log("🔊 Audio context inicializado");
      } catch (error) {
        console.error("❌ Error inicializando audio context:", error);
      }
    }
    return audioContext;
  };

  const playTone = (
    frequency: number,
    duration: number,
    delay: number,
    volume: number = 0.3
  ) => {
    try {
      const ctx = initializeAudioContext();
      if (!ctx) {
        console.error("❌ No se pudo inicializar audio context");
        return;
      }

      // Verificar si el audio context está suspendido
      if (ctx.state === "suspended") {
        console.log("🔇 Audio context suspendido, intentando resumir...");
        ctx
          .resume()
          .then(() => {
            console.log("✅ Audio context resumido");
          })
          .catch((error) => {
            console.error("❌ Error resumiendo audio context:", error);
          });
      }

      setTimeout(() => {
        try {
          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);

          oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
          oscillator.type = "sine";

          gainNode.gain.setValueAtTime(volume, ctx.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(
            0.01,
            ctx.currentTime + duration
          );

          oscillator.start(ctx.currentTime);
          oscillator.stop(ctx.currentTime + duration);

          console.log(`🔊 Tono reproducido: ${frequency}Hz por ${duration}s`);
        } catch (error) {
          console.error("❌ Error reproduciendo tono:", error);
        }
      }, delay);
    } catch (error) {
      console.error("❌ Error en playTone:", error);
    }
  };

  const notifications = {
    // Nuevo pedido: Do - Mi - Sol (ascendente, alegre)
    newOrder: () => {
      // Prevenir sonidos simultáneos
      if (isPlayingSound) {
        console.log(
          "🔇 Preveniendo sonido simultáneo - ya se está reproduciendo"
        );
        return;
      }

      isPlayingSound = true;
      console.log("🔊 Nuevo pedido recibido!");

      playTone(523.25, 0.2, 0); // Do
      playTone(659.25, 0.2, 200); // Mi
      playTone(783.99, 0.3, 400); // Sol

      // Resetear flag después de 1 segundo
      setTimeout(() => {
        isPlayingSound = false;
      }, 1000);
    },

    // Pedido a pendiente: Dos tonos medios
    orderToPending: () => {
      playTone(440, 0.15, 0); // La
      playTone(523.25, 0.15, 150); // Do
      console.log("🔊 Pedido movido a pendiente");
    },

    // Pedido a en proceso: Tono único más largo
    orderToInProgress: () => {
      playTone(659.25, 0.4, 0); // Mi largo
      console.log("🔊 Pedido en proceso");
    },

    // Impresora activada: Tono ascendente corto
    printerActivated: () => {
      playTone(349.23, 0.1, 0); // Fa
      playTone(392, 0.1, 100); // Sol
      playTone(440, 0.15, 200); // La
      console.log("🔊 Impresora activada");
    },

    // Impresora desactivada: Tono descendente
    printerDeactivated: () => {
      playTone(440, 0.15, 0); // La
      playTone(392, 0.1, 150); // Sol
      playTone(349.23, 0.1, 250); // Fa
      console.log("🔊 Impresora desactivada");
    },
  };

  return notifications;
};

export default function GlobalNotificationService() {
  const alreadyInitialized = !!win.__GNS?.initialized;
  console.log(
    "🔧 GlobalNotificationService called, isInitialized:",
    alreadyInitialized
  );

  // En desarrollo, permitir reinicialización después de hot reload
  if (process.env.NODE_ENV === "development") {
    win.__GNS.initialized = false;
  }

  // Singleton pattern - solo una instancia por página
  if (alreadyInitialized && win.__GNS?.status === "SUBSCRIBED") {
    console.log(
      "🔇 GlobalNotificationService ya inicializado, evitando duplicado"
    );
    return null;
  }

  win.__GNS.initialized = true;
  globalNotificationInstance = this;

  console.log("🔊 Inicializando GlobalNotificationService (instancia única)");

  const supabase = createClient();
  const audioNotifications = useAudioNotification();

  // Asegurar que el AudioContext se reanude tras la primera interacción del usuario (autoplay policies)
  useEffect(() => {
    const onFirstInteraction = () => {
      try {
        // Intentar inicializar por si no existe aún
        if (!audioContext && typeof window !== "undefined") {
          // @ts-ignore
          audioContext = new (window.AudioContext ||
            (window as any).webkitAudioContext)();
        }
        audioContext?.resume?.();
        // noop
      } catch {
        // ignorar
      }
    };
    window.addEventListener("click", onFirstInteraction, { once: true });
    window.addEventListener("touchstart", onFirstInteraction, { once: true });
    return () => {
      window.removeEventListener("click", onFirstInteraction);
      window.removeEventListener("touchstart", onFirstInteraction);
    };
  }, []);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("orderSoundEnabled");
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<{
    restaurant_id: string;
  } | null>(null);
  const [activePrinters, setActivePrinters] = useState<Printer[]>([]);

  // Prevenir duplicación de sonidos
  const [lastProcessedOrderId, setLastProcessedOrderId] = useState<
    number | null
  >(null);
  const [lastProcessedTimestamp, setLastProcessedTimestamp] =
    useState<number>(0);
  const [recentlyProcessedOrders, setRecentlyProcessedOrders] = useState<
    Set<number>
  >(new Set());

  // Obtener restaurant_id del usuario
  useEffect(() => {
    const fetchRestaurantId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("restaurant_id")
        .eq("id", user.id)
        .single();

      if (profile?.restaurant_id) {
        setRestaurantId(profile.restaurant_id);
        setUserProfile(profile);

        // Obtener impresoras activas iniciales
        const { data: printers } = await supabase
          .from("printers")
          .select("*")
          .eq("restaurant_id", profile.restaurant_id)
          .eq("is_active", true)
          .order("type");

        setActivePrinters(printers || []);
      }
    };

    fetchRestaurantId();
  }, [supabase]);

  // Listener global para pedidos nuevos y cambios de estado
  useEffect(() => {
    console.log(
      "🔗 Setting up real-time subscription for orders, restaurantId:",
      restaurantId
    );
    console.log("👤 UserProfile restaurant_id:", userProfile?.restaurant_id);

    const channel = supabase
      .channel("global notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        async (payload) => {
          console.log("📡 Real-time INSERT event received:", payload);
          const currentTime = Date.now();
          const orderId = (payload as any)?.new?.id as number;
          const orderRestaurantId = (payload as any)?.new?.restaurant_id as
            | string
            | null;

          // Asegurar que la orden pertenece a este restaurante
          if (!orderRestaurantId || orderRestaurantId !== restaurantId) return;

          // Prevenir duplicados: misma orden en menos de 1s
          if (
            lastProcessedOrderId === orderId &&
            currentTime - lastProcessedTimestamp < 1000
          ) {
            console.log(`🔇 Preveniendo duplicado para orden #${orderId}`);
            return;
          }

          if (soundEnabled) {
            setLastProcessedOrderId(orderId);
            setLastProcessedTimestamp(currentTime);
            setRecentlyProcessedOrders((prev) => {
              const newSet = new Set(prev);
              newSet.add(orderId);
              setTimeout(() => {
                setRecentlyProcessedOrders((current) => {
                  const updated = new Set(current);
                  updated.delete(orderId);
                  return updated;
                });
              }, 3000);
              return newSet;
            });

            try {
              audioNotifications.newOrder();
              console.log(`✅ Sonido reproducido para nueva orden #${orderId}`);
            } catch (error) {
              console.error(
                `❌ Error reproduciendo sonido para orden #${orderId}:`,
                error
              );
            }
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        async (payload) => {
          if (!soundEnabled) return;

          const oldOrder = payload.old as Order;
          const newOrder = payload.new as Order;

          // Solo reproducir sonido si la orden pertenece al restaurante del usuario
          if (newOrder.restaurant_id !== restaurantId) return;

          // Reproducir sonido si cambió el estado
          if (oldOrder.status !== newOrder.status) {
            // Evitar reproducir sonido si la orden fue procesada recientemente (INSERT)
            if (recentlyProcessedOrders.has(newOrder.id)) {
              console.log(
                `🔇 Evitando sonido de UPDATE para orden #${newOrder.id} (ya procesada por INSERT)`
              );
              return;
            }

            if (newOrder.status === "pending") {
              audioNotifications.orderToPending();
            } else if (newOrder.status === "in_progress") {
              audioNotifications.orderToInProgress();
            }
          }
        }
      )
      .subscribe((status) => {
        win.__GNS.status = status;
        win.__GNS.channel = channel;
        console.log("🔗 Orders subscription status:", status);
      });

    return () => {
      console.log("🔗 Cleaning up orders subscription");
      supabase.removeChannel(channel);
      if (win.__GNS?.channel === channel) {
        win.__GNS.channel = null;
        win.__GNS.status = "CLOSED";
        win.__GNS.initialized = false;
      }
    };
  }, [
    restaurantId,
    soundEnabled,
    audioNotifications,
    recentlyProcessedOrders,
    lastProcessedOrderId,
    lastProcessedTimestamp,
  ]);

  // Listener global para cambios en impresoras
  useEffect(() => {
    if (!restaurantId) return;

    const printerChannel = supabase
      .channel("global printer notifications")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "printers" },
        async (payload) => {
          if (!soundEnabled) return;

          const newPrinter = payload.new as Printer;

          // Verificar que la impresora pertenece al restaurante del usuario
          if (newPrinter.restaurant_id !== restaurantId) {
            return; // No es una impresora de nuestro restaurante
          }

          const oldPrinter = activePrinters.find(
            (p) => p.id === payload.new.id
          );

          // Actualizar lista de impresoras activas
          setActivePrinters((current) => {
            const updated = current.map((printer) =>
              printer.id === payload.new.id ? newPrinter : printer
            );

            // Si la impresora no estaba en la lista pero ahora está activa, agregarla
            if (!oldPrinter && newPrinter.is_active) {
              return [...updated, newPrinter];
            }

            // Si la impresora estaba activa pero ahora está inactiva, removerla
            if (oldPrinter && !newPrinter.is_active) {
              return updated.filter((p) => p.id !== newPrinter.id);
            }

            return updated;
          });

          // Reproducir sonido si cambió el estado de activación
          if (oldPrinter) {
            const wasActive = oldPrinter.is_active;
            const isActive = newPrinter.is_active;

            if (!wasActive && isActive) {
              audioNotifications.printerActivated();
            } else if (wasActive && !isActive) {
              audioNotifications.printerDeactivated();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(printerChannel);
    };
  }, [
    supabase,
    restaurantId,
    activePrinters,
    soundEnabled,
    audioNotifications,
  ]);

  // Sincronizar configuración de sonido con localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem("orderSoundEnabled");
      if (saved !== null) {
        setSoundEnabled(JSON.parse(saved));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Cleanup cuando el componente se desmonta
  useEffect(() => {
    return () => {
      console.log("🔇 Limpiando GlobalNotificationService");
      isInitialized = false;
      globalNotificationInstance = null;
    };
  }, []);

  // Este componente no renderiza nada, solo ejecuta los listeners
  return null;
}
