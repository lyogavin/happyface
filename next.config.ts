import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  transpilePackages: ['next-mdx-remote'],
  output: "standalone",
  serverExternalPackages: ["shiki"],
  outputFileTracingIncludes: {
    '/': ['./content/**/*'],
  },
  experimental: {
    // ... any other experimental options would go here
  } as any,
  images: {
    remotePatterns: [
      // ... existing patterns ...
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
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
