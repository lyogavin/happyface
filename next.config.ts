import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ['next-mdx-remote'],
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ["shiki"],
    outputFileTracingIncludes: {
      '/': ['./content/**/*'],
    },
  } as any,
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
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
