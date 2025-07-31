"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { Plus, Users, Settings, Trash2 } from "lucide-react";

interface Restaurant {
  id: string;
  name: string;
  created_at: string;
  user_count: number;
  table_count: number;
  category_count: number;
  menu_item_count: number;
}

interface User {
  id: string;
  full_name: string | null;
  role: string;
  restaurant_id: string | null;
  restaurant_name: string | null;
}

export default function RestaurantsAdminPage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);

  // Form states
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    admin_email: "",
    admin_password: "",
    admin_full_name: "",
  });

  const [assignUser, setAssignUser] = useState({
    user_email: "",
    restaurant_id: "",
    role: "staff",
  });

  const supabase = createClient();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Cargar restaurantes con estadísticas
      const { data: restaurantsData } = await supabase
        .from("restaurants")
        .select(
          `
          id,
          name,
          created_at,
          profiles!restaurant_id(count),
          tables!restaurant_id(count),
          menu_categories!restaurant_id(count),
          menu_items!restaurant_id(count)
        `
        )
        .order("created_at", { ascending: false });

      if (restaurantsData) {
        const formattedRestaurants = restaurantsData.map((r) => ({
          id: r.id,
          name: r.name,
          created_at: r.created_at,
          user_count: r.profiles?.[0]?.count || 0,
          table_count: r.tables?.[0]?.count || 0,
          category_count: r.menu_categories?.[0]?.count || 0,
          menu_item_count: r.menu_items?.[0]?.count || 0,
        }));
        setRestaurants(formattedRestaurants);
      }

      // Cargar usuarios
      const { data: usersData } = await supabase
        .from("profiles")
        .select(
          `
          id,
          full_name,
          role,
          restaurant_id,
          restaurants!restaurant_id(name)
        `
        )
        .order("created_at", { ascending: false });

      if (usersData) {
        const formattedUsers = usersData.map((u) => ({
          id: u.id,
          full_name: u.full_name,
          role: u.role,
          restaurant_id: u.restaurant_id,
          restaurant_name: u.restaurants?.name || null,
        }));
        setUsers(formattedUsers);
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase.rpc("create_new_restaurant", {
        restaurant_name: newRestaurant.name,
        admin_email: newRestaurant.admin_email,
        admin_password: newRestaurant.admin_password,
        admin_full_name: newRestaurant.admin_full_name,
      });

      if (error) throw error;

      if (data?.success) {
        alert("Restaurante creado exitosamente");
        setShowCreateForm(false);
        setNewRestaurant({
          name: "",
          admin_email: "",
          admin_password: "",
          admin_full_name: "",
        });
        loadData();
      } else {
        alert(`Error: ${data?.error}`);
      }
    } catch (error) {
      console.error("Error creating restaurant:", error);
      alert("Error al crear el restaurante");
    }
  };

  const handleAssignUser = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { data, error } = await supabase.rpc("assign_user_to_restaurant", {
        user_email: assignUser.user_email,
        restaurant_id: assignUser.restaurant_id,
        role: assignUser.role,
      });

      if (error) throw error;

      if (data?.success) {
        alert("Usuario asignado exitosamente");
        setShowAssignForm(false);
        setAssignUser({ user_email: "", restaurant_id: "", role: "staff" });
        loadData();
      } else {
        alert(`Error: ${data?.error}`);
      }
    } catch (error) {
      console.error("Error assigning user:", error);
      alert("Error al asignar usuario");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Administración de Restaurantes
          </h1>
          <p className="text-gray-600 mt-2">
            Gestiona múltiples restaurantes y sus usuarios
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
          >
            <Plus size={20} />
            Crear Nuevo Restaurante
          </button>

          <button
            onClick={() => setShowAssignForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
          >
            <Users size={20} />
            Asignar Usuario
          </button>
        </div>

        {/* Restaurants Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {restaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  {restaurant.name}
                </h3>
                <button className="text-red-600 hover:text-red-800">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <p>Usuarios: {restaurant.user_count}</p>
                <p>Mesas: {restaurant.table_count}</p>
                <p>Categorías: {restaurant.category_count}</p>
                <p>Productos: {restaurant.menu_item_count}</p>
                <p>
                  Creado: {new Date(restaurant.created_at).toLocaleDateString()}
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <button className="bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200">
                  <Settings size={14} className="inline mr-1" />
                  Configurar
                </button>
                <button className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200">
                  <Users size={14} className="inline mr-1" />
                  Usuarios
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-gray-900">
              Usuarios del Sistema
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Restaurante
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.full_name || "Sin nombre"}
                      </div>
                      <div className="text-sm text-gray-500">{user.id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          user.role === "admin"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.restaurant_name || "Sin asignar"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-blue-600 hover:text-blue-900 mr-3">
                        Editar
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Restaurant Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Crear Nuevo Restaurante
            </h2>
            <form onSubmit={handleCreateRestaurant}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre del Restaurante
                  </label>
                  <input
                    type="text"
                    required
                    value={newRestaurant.name}
                    onChange={(e) =>
                      setNewRestaurant({
                        ...newRestaurant,
                        name: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email del Admin
                  </label>
                  <input
                    type="email"
                    required
                    value={newRestaurant.admin_email}
                    onChange={(e) =>
                      setNewRestaurant({
                        ...newRestaurant,
                        admin_email: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contraseña del Admin
                  </label>
                  <input
                    type="password"
                    required
                    value={newRestaurant.admin_password}
                    onChange={(e) =>
                      setNewRestaurant({
                        ...newRestaurant,
                        admin_password: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nombre del Admin
                  </label>
                  <input
                    type="text"
                    value={newRestaurant.admin_full_name}
                    onChange={(e) =>
                      setNewRestaurant({
                        ...newRestaurant,
                        admin_full_name: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                >
                  Crear
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign User Modal */}
      {showAssignForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Asignar Usuario a Restaurante
            </h2>
            <form onSubmit={handleAssignUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email del Usuario
                  </label>
                  <input
                    type="email"
                    required
                    value={assignUser.user_email}
                    onChange={(e) =>
                      setAssignUser({
                        ...assignUser,
                        user_email: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Restaurante
                  </label>
                  <select
                    required
                    value={assignUser.restaurant_id}
                    onChange={(e) =>
                      setAssignUser({
                        ...assignUser,
                        restaurant_id: e.target.value,
                      })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="">Seleccionar restaurante</option>
                    {restaurants.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Rol
                  </label>
                  <select
                    required
                    value={assignUser.role}
                    onChange={(e) =>
                      setAssignUser({ ...assignUser, role: e.target.value })
                    }
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                >
                  Asignar
                </button>
                <button
                  type="button"
                  onClick={() => setShowAssignForm(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
