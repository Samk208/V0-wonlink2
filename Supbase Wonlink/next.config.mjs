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
  // swcMinify is now enabled by default in Next.js 15
}

export default nextConfig
