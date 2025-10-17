import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: "/home/fabian/Code/web3/Tera-Finance/Tera-MiniApps",
  webpack: (config, { isServer }) => {
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Ignore optional dependencies that are not needed for browser environment
    config.ignoreWarnings = [
      { module: /node_modules\/@react-native-async-storage\/async-storage/ },
      { module: /node_modules\/pino-pretty/ },
    ];

    // Add alias to resolve optional modules as empty modules
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
      'pino-pretty': false,
    };

    return config;
  },
};

export default nextConfig;
