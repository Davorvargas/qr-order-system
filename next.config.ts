/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        // This is your Supabase project hostname
        hostname: 'osvgapxefsqqhltkabku.supabase.co', 
      },
    ],
  },
};

export default nextConfig;