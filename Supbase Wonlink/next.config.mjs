/** @type {import('next').NextConfig} */
const nextConfig = {
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Korean government compliance
  poweredByHeader: false,
  compress: true,
  // Mobile-first optimizations
  swcMinify: true,
}

export default nextConfig
