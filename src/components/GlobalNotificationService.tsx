"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { Database } from "@/lib/database.types";

type Order = Database["public"]["Tables"]["orders"]["Row"] & {
  table?: { table_number?: string };
  order_items?: any[];
};
type Printer = Database["public"]["Tables"]["printers"]["Row"];

// Enhanced Audio notification hook with different sound types
const useAudioNotification = () => {
  const playTone = (frequency: number, duration: number, delay: number, volume: number = 0.3) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(volume, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
      }, delay);
    } catch (error) {
      console.log('Audio notification not available:', error);
    }
  };

  const notifications = {
    // Nuevo pedido: Do - Mi - Sol (ascendente, alegre)
    newOrder: () => {
      playTone(523.25, 0.2, 0);    // Do
      playTone(659.25, 0.2, 200);  // Mi  
      playTone(783.99, 0.3, 400);  // Sol
      console.log('🔊 Nuevo pedido recibido!');
    },
    
    // Pedido a pendiente: Dos tonos medios
    orderToPending: () => {
      playTone(440, 0.15, 0);    // La
      playTone(523.25, 0.15, 150);  // Do
      console.log('🔊 Pedido movido a pendiente');
    },
    
    // Pedido a en proceso: Tono único más largo
    orderToInProgress: () => {
      playTone(659.25, 0.4, 0);    // Mi largo
      console.log('🔊 Pedido en proceso');
    },
    
    // Impresora activada: Tono ascendente corto
    printerActivated: () => {
      playTone(349.23, 0.1, 0);    // Fa
      playTone(392, 0.1, 100);     // Sol
      playTone(440, 0.15, 200);    // La
      console.log('🔊 Impresora activada');
    },
    
    // Impresora desactivada: Tono descendente
    printerDeactivated: () => {
      playTone(440, 0.15, 0);      // La
      playTone(392, 0.1, 150);     // Sol
      playTone(349.23, 0.1, 250);  // Fa
      console.log('🔊 Impresora desactivada');
    }
  };
  
  return notifications;
};

export default function GlobalNotificationService() {
  const supabase = createClient();
  const audioNotifications = useAudioNotification();
  const [soundEnabled, setSoundEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('orderSoundEnabled');
      return saved !== null ? JSON.parse(saved) : true;
    }
    return true;
  });
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [activePrinters, setActivePrinters] = useState<Printer[]>([]);

  // Obtener restaurant_id del usuario
  useEffect(() => {
    const fetchRestaurantId = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('restaurant_id')
        .eq('id', user.id)
        .single();

      if (profile?.restaurant_id) {
        setRestaurantId(profile.restaurant_id);

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
    if (!restaurantId) return;

    const channel = supabase
      .channel("global notifications")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        async (payload) => {
          // Verificar que el pedido pertenece al restaurante del usuario
          const { data: profile } = await supabase.auth.getUser();
          if (!profile.user) return;
          
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('restaurant_id')
            .eq('id', profile.user.id)
            .single();

          // Obtener detalles completos del pedido
          const { data: newOrderDetails } = await supabase
            .from("orders")
            .select(`
              *,
              table:tables(table_number),
              order_items(*)
            `)
            .eq("id", payload.new.id)
            .eq('restaurant_id', userProfile?.restaurant_id)
            .single();
            
          if (newOrderDetails && soundEnabled) {
            audioNotifications.newOrder();
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          if (!soundEnabled) return;
          
          const oldOrder = payload.old as Order;
          const newOrder = payload.new as Order;
          
          // Reproducir sonido si cambió el estado
          if (oldOrder.status !== newOrder.status) {
            if (newOrder.status === 'pending') {
              audioNotifications.orderToPending();
            } else if (newOrder.status === 'in_progress') {
              audioNotifications.orderToInProgress();
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, restaurantId, soundEnabled, audioNotifications]);

  // Listener global para cambios en impresoras
  useEffect(() => {
    if (!restaurantId) return;

    const printerChannel = supabase
      .channel("global printer notifications")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "printers" },
        (payload) => {
          if (!soundEnabled) return;
          
          const oldPrinter = activePrinters.find(p => p.id === payload.new.id);
          const newPrinter = payload.new as Printer;
          
          // Actualizar lista de impresoras activas
          setActivePrinters((current) => {
            const updated = current.map((printer) =>
              printer.id === payload.new.id ? newPrinter : printer
            );
            
            // Si la impresora no estaba en la lista pero ahora está activa, agregarla
            if (!oldPrinter && newPrinter.is_active && newPrinter.restaurant_id === restaurantId) {
              return [...updated, newPrinter];
            }
            
            // Si la impresora estaba activa pero ahora está inactiva, removerla
            if (oldPrinter && !newPrinter.is_active) {
              return updated.filter(p => p.id !== newPrinter.id);
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
  }, [supabase, restaurantId, activePrinters, soundEnabled, audioNotifications]);

  // Sincronizar configuración de sonido con localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const saved = localStorage.getItem('orderSoundEnabled');
      if (saved !== null) {
        setSoundEnabled(JSON.parse(saved));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Este componente no renderiza nada, solo ejecuta los listeners
  return null;
}