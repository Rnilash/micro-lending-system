/** @type {import('next').NextConfig} */
const nextConfig = {
  // Basic configuration
  reactStrictMode: true,
  swcMinify: true,
  
  // Experimental features
  experimental: {
    // Enable app directory (Next.js 13+)
    appDir: true,
    // Server components optimizations
    serverComponentsExternalPackages: ['firebase-admin'],
    // Faster refresh
    optimizePackageImports: ['@heroicons/react', 'lucide-react', 'date-fns']
  },

  // Performance optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Image optimization
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'lh3.googleusercontent.com', // Google profile images
      'graph.facebook.com', // Facebook profile images
      'avatars.githubusercontent.com' // GitHub profile images
    ],
    formats: ['image/webp', 'image/avif'],
  },

  // PWA configuration
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: process.env.NODE_ENV === 'production' 
              ? 'https://your-domain.com' 
              : 'http://localhost:3000',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: false,
      },
      {
        source: '/login',
        destination: '/auth/login',
        permanent: true,
      },
    ];
  },

  // Rewrites for API
  async rewrites() {
    return [
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',
      },
    ];
  },

  // Internationalization
  i18n: {
    locales: ['en', 'si', 'si-LK'],
    defaultLocale: 'en',
    localeDetection: true,
  },

  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Fix for Firebase in client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }

    // Sinhala font optimization
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
      generator: {
        filename: 'static/fonts/[hash][ext][query]',
      },
    });

    // Bundle analyzer in development
    if (dev && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          openAnalyzer: true,
        })
      );
    }

    return config;
  },

  // Environment variables
  env: {
    CUSTOM_BUILD_ID: process.env.BUILD_ID || 'development',
    CUSTOM_BUILD_TIME: new Date().toISOString(),
  },

  // Output configuration for different deployments
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,

  // Trailing slash handling
  trailingSlash: false,

  // PoweredBy header
  poweredByHeader: false,

  // Compression
  compress: true,

  // Development indicators
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: 'bottom-right',
  },

  // TypeScript configuration
  typescript: {
    // Type checking is done separately in CI/CD
    ignoreBuildErrors: process.env.NODE_ENV === 'production',
  },

  // ESLint configuration
  eslint: {
    // ESLint is run separately in CI/CD
    ignoreDuringBuilds: process.env.NODE_ENV === 'production',
  },
};

// Additional plugins based on environment
if (process.env.NODE_ENV === 'production') {
  // Production-specific optimizations
  nextConfig.experimental = {
    ...nextConfig.experimental,
    // Enable static optimization
    isrMemoryCacheSize: 0,
  };
}

module.exports = nextConfig;