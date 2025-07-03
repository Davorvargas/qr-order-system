// src/app/admin/menu/page.tsx
import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import MenuManager from '@/components/MenuManager'; // <-- Import the new manager component

// Fetches categories and items
async function getMenuData() {
  const supabase = await createClient();
  const { data: categories } = await supabase.from('menu_categories').select('id, name').order('name');
  const { data: menuItems } = await supabase.from('menu_items').select('*, menu_categories(name)').order('id');
  return { categories: categories || [], menuItems: menuItems || [] };
}

// Gets user profile for role check
async function getUserProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) { return { user: null, profile: null }; }
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  return { user, profile };
}

export default async function AdminMenuPage() {
  const { user, profile } = await getUserProfile();

  // Protection Logic
  if (!user) { redirect('/login'); }
  if (profile?.role !== 'admin') {
    return (
      <main className="p-8">
        <h1 className="text-2xl font-bold">Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </main>
    );
  }

  const { categories, menuItems } = await getMenuData();

  return (
    <main className="flex min-h-screen flex-col p-8">
      <div className="w-full max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Menu Management</h1>
        <p className="mb-8">Welcome, Admin! ({user.email})</p>

        {/* Render the client component that manages the state */}
        <MenuManager initialItems={menuItems} categories={categories} />
      </div>
    </main>
  );
}