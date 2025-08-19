import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import CostEditor from './CostEditor';

export default async function ManageCostsPage() {
  const supabase = await createClient();

  // Verificar autenticación
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    redirect('/login');
  }

  // Verificar rol de administrador
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, restaurant_id')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || profile.role !== 'admin') {
    redirect('/unauthorized');
  }

  // Obtener todos los productos del restaurante
  const { data: menuItems, error: itemsError } = await supabase
    .from('menu_items')
    .select(`
      id,
      name,
      description,
      price,
      cost,
      category_id,
      is_available,
      categories(name)
    `)
    .eq('restaurant_id', profile.restaurant_id)
    .order('category_id', { ascending: true })
    .order('name', { ascending: true });

  if (itemsError) {
    console.error('Error fetching menu items:', itemsError);
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            Error al cargar los productos. Por favor, inténtalo de nuevo.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Gestión de Costos
          </h1>
          <p className="text-gray-600">
            Administra los costos de tus productos para calcular las ganancias
          </p>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Total Productos</h3>
            <p className="text-2xl font-bold text-gray-900">{menuItems?.length || 0}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Con Costo Definido</h3>
            <p className="text-2xl font-bold text-green-600">
              {menuItems?.filter(item => item.cost && item.cost > 0).length || 0}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500">Sin Costo</h3>
            <p className="text-2xl font-bold text-red-600">
              {menuItems?.filter(item => !item.cost || item.cost <= 0).length || 0}
            </p>
          </div>
        </div>

        {/* Editor de costos */}
        <div className="bg-white rounded-lg shadow">
          <CostEditor 
            initialItems={menuItems || []} 
            restaurantId={profile.restaurant_id}
          />
        </div>
      </div>
    </div>
  );
}