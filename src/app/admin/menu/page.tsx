// src/app/admin/menu/page.tsx
"use client";

import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MenuManager from "@/components/MenuManager";
import StaffLayout from "@/components/StaffLayout";
import { User } from "@supabase/supabase-js";

// Define types here to be used in the component state
type Category = { id: number; name: string };
type MenuItem = {
  id: number;
  name: string;
  description: string | null;
  price: number | null;
  category_id: number | null;
  is_available: boolean;
  image_url: string | null;
  menu_categories: { name: string } | null;
};

export default function AdminMenuPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ role: string } | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getInitialData = async () => {
      // 1. Get User and Profile
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileData?.role !== "admin") {
        // Not an admin, set profile and stop loading but don't fetch data
        setProfile(profileData);
        setLoading(false);
        return;
      }
      setProfile(profileData);

      // 2. Get Menu Data (only if admin)
      const { data: categoriesData } = await supabase
        .from("menu_categories")
        .select("id, name")
        .order("name");
      const { data: menuItemsData } = await supabase
        .from("menu_items")
        .select("*, menu_categories(name)")
        .order("id");

      setCategories(categoriesData || []);
      setMenuItems((menuItemsData as MenuItem[]) || []);
      setLoading(false);
    };

    getInitialData();
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  // Initial loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    );
  }

  // Access Denied message
  if (profile?.role !== "admin") {
    return (
      <StaffLayout userEmail={user?.email} onLogout={handleLogout}>
        <div className="text-center">
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="mt-2">You do not have permission to view this page.</p>
        </div>
      </StaffLayout>
    );
  }

  // Main content for admin
  return (
    <StaffLayout userEmail={user?.email} onLogout={handleLogout}>
      <MenuManager initialItems={menuItems} categories={categories} />
    </StaffLayout>
  );
}
