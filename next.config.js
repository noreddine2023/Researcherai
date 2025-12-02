/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['api.semanticscholar.org', 'openalex.org'],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
}

module.exports = nextConfig
