import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: (process.env.NEXT_PUBLIC_ALLOWED_IMAGE_DOMAINS || '').split(',').filter(Boolean),
  },
  /* config options here */
};

export default nextConfig;
