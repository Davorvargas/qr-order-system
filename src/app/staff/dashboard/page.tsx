// src/app/staff/dashboard/page.tsx
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import OrderList from '@/components/OrderList'; // <-- Import the new component

// getOrders function remains the same
async function getOrders() {
  // ... (no changes needed here)
  const supabase = await createClient();
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching orders:', error.message);
    return [];
  }
  return orders;
}

export default async function StaffDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch the initial list of orders when the page first loads
  const initialOrders = await getOrders();

  return (
    <main className="flex min-h-screen flex-col p-8">
      <div className="w-full max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Staff Dashboard</h1>
          <span className="text-sm text-gray-600">{user.email}</span>
        </div>

        {/* Render the OrderList component, passing the initial data */}
        <OrderList initialOrders={initialOrders} />

      </div>
    </main>
  );
}