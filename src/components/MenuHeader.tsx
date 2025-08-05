"use client";

import Image from "next/image";

interface MenuHeaderProps {
  tableNumber: string;
  restaurantName?: string;
  featuredImages?: string[];
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
}

export default function MenuHeader({
  tableNumber,
  restaurantName = "SENDEROS",
  featuredImages = [],
  logoUrl,
  primaryColor = "#1e40af",
  secondaryColor = "#fbbf24",
}: MenuHeaderProps) {
  return (
    <div className="w-full">
      {/* Header with food images and branding */}
      <div className="relative h-48 bg-gradient-to-r from-gray-50 to-gray-100 overflow-hidden">
        {/* Food images background */}
        <div className="absolute inset-0 flex">
          {featuredImages.length > 0 ? (
            featuredImages.map((image, index) => (
              <div key={index} className="flex-1 relative">
                <Image
                  src={image}
                  alt={`Featured dish ${index + 1}`}
                  fill
                  className="object-cover opacity-60"
                />
              </div>
            ))
          ) : (
            // Placeholder food images with gradients
            <>
              <div className="flex-1 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
                <span className="text-6xl">🥗</span>
              </div>
              <div className="flex-1 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center">
                <span className="text-6xl">🍝</span>
              </div>
              <div className="flex-1 bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
                <span className="text-6xl">🍖</span>
              </div>
            </>
          )}
        </div>

        {/* Restaurant branding overlay - centered logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="px-8 py-4 rounded-full shadow-lg"
            style={{ 
              backgroundColor: `${secondaryColor}dd`,
              backdropFilter: 'blur(10px)'
            }}
          >
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={restaurantName}
                width={120}
                height={60}
                className="object-contain"
              />
            ) : (
              <h1 
                className="text-2xl font-bold"
                style={{ color: primaryColor }}
              >
                {restaurantName}
              </h1>
            )}
          </div>
        </div>

        {/* Table number overlay */}
        <div className="absolute bottom-4 left-4">
          <div className="bg-white bg-opacity-80 px-3 py-1 rounded-full">
            <span className="text-sm font-medium text-gray-700">
              Mesa {tableNumber}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
