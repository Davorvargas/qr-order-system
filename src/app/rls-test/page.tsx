// src/app/rls-test/page.tsx
"use client";
import { createClient } from "@/utils/supabase/client";

export default function RlsTestPage() {
  const supabase = createClient();

  const handleTestInsert = async () => {
    alert(
      "Attempting to insert a test order. Check the F12 developer console for the result."
    );

    const { error } = await supabase.from("orders").insert({
      table_id: "test-123",
      customer_name: "Test Customer",
      total_price: 99.99,
    });

    if (error) {
      alert(`Test Failed! The database returned an error: ${error.message}`);
    } else {
      alert(
        "Success! A test order was created. Please check the 'orders' table in your Supabase dashboard."
      );
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">RLS Insert Test Page</h1>
        <p className="mb-8">
          This page tests the most basic insert functionality.
        </p>
        <p className="mb-8 font-bold">
          Please make sure you are logged out before clicking the button.
        </p>
        <button
          onClick={handleTestInsert}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded"
        >
          Run Anonymous Insert Test
        </button>
      </div>
    </main>
  );
}
