import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      // ... existing patterns ...
      {
        protocol: 'https',
        hostname: 'bjqbwtqznzladztznntj.supabase.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'www.aitoolhunt.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
