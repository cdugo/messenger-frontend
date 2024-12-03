import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: (process.env.NEXT_PUBLIC_ALLOWED_IMAGE_DOMAINS || 'localhost').split(',').filter(Boolean) || ['localhost'],
  },
  /* config options here */
};

export default nextConfig;
