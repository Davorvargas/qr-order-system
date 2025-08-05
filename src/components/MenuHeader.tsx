"use client";

import Image from "next/image";

interface MenuHeaderProps {
  tableNumber: string;
  restaurantName?: string;
  featuredImages?: string[];
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  isScrolled?: boolean;
}

export default function MenuHeader({
  tableNumber,
  restaurantName = "SENDEROS",
  featuredImages = [],
  logoUrl,
  primaryColor = "#1e40af",
  secondaryColor = "#fbbf24",
  isScrolled = false,
}: MenuHeaderProps) {
  const backgroundImage = "/images/senderos-background.jpeg";
  const logoImage = logoUrl || "/images/senderos-logo.jpg";

  if (isScrolled) {
    // Header contraído - logo maximizado con color de fondo del logo
    return (
      <div className="fixed top-0 left-0 right-0 z-50 h-16 shadow-lg transition-all duration-300" style={{backgroundColor: '#E8D3B8'}}>
        <div className="flex items-center justify-center h-full px-2">
          <div className="w-14 h-14 rounded-full shadow-lg overflow-hidden">
            <Image
              src={logoImage}
              alt={`Logo ${restaurantName}`}
              width={56}
              height={56}
              className="object-cover"
            />
          </div>
        </div>
      </div>
    );
  }

  // Header expandido - imagen de fondo + logo + mesa info
  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-48 bg-white shadow-sm transition-all duration-300">
      {/* Imagen de fondo */}
      <div className="relative h-28 w-full overflow-hidden">
        <Image
          src={backgroundImage}
          alt="Cuñapes Senderos"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-white/60"></div>
      </div>

      {/* Logo circular aún más grande */}
      <div className="absolute top-16 left-1/2 transform -translate-x-1/2">
        <div className="w-24 h-24 rounded-full shadow-xl overflow-hidden">
          <Image
            src={logoImage}
            alt={`Logo ${restaurantName}`}
            width={96}
            height={96}
            className="object-cover"
          />
        </div>
      </div>

      {/* Info de mesa más grande y centrada */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
        <p className="text-gray-700 text-lg font-semibold text-center">Mesa {tableNumber}</p>
      </div>
    </div>
  );
}