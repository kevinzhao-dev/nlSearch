/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:50051/:path*', // Proxy to the gRPC web endpoint
      },
    ];
  },
};

module.exports = nextConfig;