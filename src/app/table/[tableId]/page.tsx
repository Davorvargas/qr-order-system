// src/app/table/[tableId]/page.tsx

// Define props type to receive route parameters
interface TablePageProps {
    params: {
      tableId: string; // Matches the folder name [tableId]
    };
    // We can also get searchParams if needed: searchParams: { [key: string]: string | string[] | undefined };
  }
  
  // This page is also a Server Component by default
  export default function TablePage({ params }: TablePageProps) {
    const { tableId } = params; // Extract the tableId from the params prop
  
    return (
      <main className="flex min-h-screen flex-col items-center p-12 md:p-24">
        {/* Display the dynamic table ID */}
        <h1 className="text-4xl font-bold mb-8">Welcome to Table {tableId}</h1>
  
        <div className="w-full max-w-4xl space-y-8"> {/* Added space-y for gaps */}
          {/* Placeholder for Customer Name Input */}
          <section className="p-4 border rounded bg-gray-50 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Your Name</h2>
            {/* We'll add an input field here later */}
            <p className="text-gray-600">(Input field coming soon)</p>
          </section>
  
          {/* Placeholder for Menu */}
          <section className="p-4 border rounded bg-gray-50 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Menu</h2>
            {/* We'll fetch and display the menu here later */}
            <p className="text-gray-600">(Menu display and selection coming soon)</p>
          </section>
  
          {/* Placeholder for Order Summary */}
          <section className="p-4 border rounded bg-gray-50 shadow-sm">
            <h2 className="text-xl font-semibold mb-2">Your Order</h2>
            <p className="text-gray-600">(Order summary coming soon)</p>
          </section>
  
          {/* Placeholder for Place Order Button */}
          <section className="text-center">
            <button
              disabled // Disabled for now
              className="bg-blue-500 text-white font-bold py-2 px-6 rounded opacity-50 cursor-not-allowed"
            >
              Place Order
            </button>
          </section>
        </div>
      </main>
    );
  }