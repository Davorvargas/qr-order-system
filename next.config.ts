import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Warning: This allows production builds to successfully complete even if
    // your project has TypeScript errors.
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // This is your Supabase project hostname
        hostname: 'osvgapxefsqqhltkabku.supabase.co', 
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // Optimizar para reducir transformaciones
    formats: ['image/webp'], // Solo webp, no avif
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Reducir tamaños
    imageSizes: [16, 32, 48, 64, 96, 128, 256], // Reducir tamaños
    // Reducir calidad para optimizar más - según recomendaciones de Vercel
    qualities: [75, 50, 25], // Calidades más bajas para reducir tamaño
    // Deshabilitar optimización para imágenes estáticas
    unoptimized: false,
    // Configurar cache más agresivo - 31 días como recomienda Vercel
    minimumCacheTTL: 2678400, // 31 días en segundos
  },
};

export default nextConfig;