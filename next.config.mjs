/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Reduce logging in development
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
  // TypeScript and ESLint checking enabled
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  // Headers for security and permissions
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'payment=(self "https://js.stripe.com" "https://hooks.stripe.com")',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
