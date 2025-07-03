"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client'; // <-- Updated import
import Link from 'next/link';
import { User } from '@supabase/supabase-js';

export default function Header() {
  const supabase = createClient(); // <-- Initialize client here
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]); // Added supabase to dependency array

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <header className="bg-gray-800 text-white p-4 flex justify-between items-center shadow-md">
      <Link href="/" className="text-xl font-bold hover:text-gray-300">
        QR Order System
      </Link>
      <nav>
        {user ? (
          <div className="flex items-center gap-4">
            <span>{user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-red-500 hover:bg-red-600 px-3 py-1 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        ) : (
          <Link href="/login" className="hover:underline">
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}