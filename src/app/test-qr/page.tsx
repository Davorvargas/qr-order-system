"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";

interface Restaurant {
  id: string;
  name: string | null;
}

interface Table {
  id: string;
  table_number: string;
}

interface Category {
  id: number;
  name: string;
  is_available: boolean;
}

interface MenuItem {
  id: number;
  name: string;
  price: number | null;
  is_available: boolean;
}

interface QRUrl {
  mesa: string;
  id: string;
  url: string;
}

interface DiagnosticData {
  restaurant: Restaurant;
  tables: Table[];
  categories: Category[];
  menuItems: MenuItem[];
  qrUrls: QRUrl[];
}

export default function TestQRPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DiagnosticData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function testQRData() {
      try {
        setLoading(true);
        const supabase = createClient();

        // 1. Verificar restaurantes
        const { data: restaurants, error: restaurantsError } = await supabase
          .from("restaurants")
          .select("id, name")
          .limit(1);

        if (restaurantsError) {
          throw new Error(`Error restaurantes: ${restaurantsError.message}`);
        }

        if (!restaurants || restaurants.length === 0) {
          setData({ error: "No hay restaurantes configurados" } as any);
          return;
        }

        const restaurant = restaurants[0];

        // 2. Obtener mesas
        const { data: tables, error: tablesError } = await supabase
          .from("tables")
          .select("id, table_number")
          .eq("restaurant_id", restaurant.id)
          .order("table_number");

        if (tablesError) {
          throw new Error(`Error mesas: ${tablesError.message}`);
        }

        // 3. Obtener categorías
        const { data: categories, error: categoriesError } = await supabase
          .from("menu_categories")
          .select("id, name, is_available")
          .eq("restaurant_id", restaurant.id);

        if (categoriesError) {
          throw new Error(`Error categorías: ${categoriesError.message}`);
        }

        // 4. Obtener elementos del menú
        const { data: menuItems, error: menuItemsError } = await supabase
          .from("menu_items")
          .select("id, name, price, is_available")
          .eq("restaurant_id", restaurant.id);

        if (menuItemsError) {
          throw new Error(
            `Error elementos del menú: ${menuItemsError.message}`
          );
        }

        // 5. Generar URLs de ejemplo
        const baseUrl = window.location.origin;
        const qrUrls =
          tables?.slice(0, 3).map((table) => ({
            mesa: table.table_number,
            id: table.id,
            url: `${baseUrl}/menu/${table.id}`,
          })) || [];

        setData({
          restaurant,
          tables: tables || [],
          categories: categories || [],
          menuItems: menuItems || [],
          qrUrls,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error desconocido");
      } finally {
        setLoading(false);
      }
    }

    testQRData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando estado de códigos QR...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Error en el diagnóstico
          </h1>
          <p className="text-red-600 mb-4">{error}</p>
          <p className="text-gray-600">
            Verifica la configuración de Supabase y las políticas RLS
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No se pudieron obtener los datos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🔍 Diagnóstico de Códigos QR
          </h1>
          <p className="text-gray-600">
            Estado actual del sistema de códigos QR
          </p>
        </div>

        {/* Resumen */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">📊 Resumen del Sistema</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {data.restaurant?.name || "Sin nombre"}
              </div>
              <div className="text-sm text-gray-600">Restaurante</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {data.tables.length}
              </div>
              <div className="text-sm text-gray-600">Mesas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {data.categories.length}
              </div>
              <div className="text-sm text-gray-600">Categorías</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {data.menuItems.length}
              </div>
              <div className="text-sm text-gray-600">Productos</div>
            </div>
          </div>
        </div>

        {/* Mesas */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🪑 Mesas Configuradas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.tables.map((table) => (
              <div
                key={table.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="font-semibold text-lg">
                  Mesa {table.table_number}
                </div>
                <div className="text-sm text-gray-600">ID: {table.id}</div>
                <div className="text-sm text-blue-600 mt-2">
                  URL: {window.location.origin}/menu/{table.id}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* URLs de QR */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            📱 URLs de Códigos QR (Ejemplo)
          </h2>
          <div className="space-y-3">
            {data.qrUrls.map((qr) => (
              <div
                key={qr.id}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="font-semibold">Mesa {qr.mesa}</div>
                <div className="text-sm text-blue-600 break-all">{qr.url}</div>
                <button
                  onClick={() => window.open(qr.url, "_blank")}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Probar URL
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Productos del menú */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">🍽️ Productos del Menú</h2>
          {data.menuItems.length === 0 ? (
            <p className="text-gray-600">No hay productos en el menú</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.menuItems.slice(0, 6).map((item) => (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-green-600 font-bold">
                    Bs. {item.price || 0}
                  </div>
                  <div
                    className={`text-sm ${
                      item.is_available ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {item.is_available ? "✅ Disponible" : "❌ No disponible"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Estado del sistema */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">✅ Estado del Sistema</h2>
          <div className="space-y-3">
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✅</span>
              <span>Variables de entorno configuradas</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✅</span>
              <span>Conexión a Supabase establecida</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✅</span>
              <span>{data.tables.length} mesas configuradas</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-600 mr-2">✅</span>
              <span>{data.categories.length} categorías disponibles</span>
            </div>
            <div className="flex items-center">
              {data.menuItems.length > 0 ? (
                <>
                  <span className="text-green-600 mr-2">✅</span>
                  <span>{data.menuItems.length} productos en el menú</span>
                </>
              ) : (
                <>
                  <span className="text-yellow-600 mr-2">⚠️</span>
                  <span>No hay productos en el menú</span>
                </>
              )}
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold mb-2">🎯 Próximos Pasos:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm">
              <li>
                Ve a{" "}
                <a
                  href="/staff/qr-codes"
                  className="text-blue-600 hover:underline"
                >
                  Códigos QR
                </a>{" "}
                para generar/descargar los códigos
              </li>
              <li>Escanea un código QR desde tu teléfono</li>
              <li>Verifica que se abra la página del menú correctamente</li>
              {data.menuItems.length === 0 && (
                <li>
                  Agrega productos al menú para que los clientes puedan ver algo
                </li>
              )}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
