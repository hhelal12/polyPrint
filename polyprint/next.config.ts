import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true, // This tells browsers to remember the redirect
      },
    ];
  },
};

export default nextConfig;
