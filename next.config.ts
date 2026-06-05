import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
   headers: async () => [
    {
      source: '/(.*)',
      headers: [
        { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' }, // Force un rechargement propre des CSS/JS
      ],
    },
  ],
   allowedDevOrigins: [
    '192.168.208.1',
    '127.0.0.1',
     '192.168.*.*',
      '*.trycloudflare.com',
            // Your specific network IP
    '*.local-origin.dev'    // Optional: if you have custom local domains
  ],
  experimental: {
    serverActions:{
 bodySizeLimit: '5mb',
    },
    optimizeCss: true, // (Laisse actif pour un CSS optimisé, mais surveille le rendu)
  },
};

export default nextConfig;
