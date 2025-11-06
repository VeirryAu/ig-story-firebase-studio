import type {NextConfig} from 'next';
import path from 'path';
import {
  copyFileSync,
  existsSync,
  mkdirpSync,
} from '@genkit-ai/docs/node_modules/fs-extra';
const CopyPlugin = require('copy-webpack-plugin');

const nextConfig: NextConfig = {
  /* config options here */
  output: 'export',
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
  webpack: (config, {isServer, dev}) => {
    if (!dev && !isServer) {
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: path.join(__dirname, 'public/sw.js'),
              to: path.join(__dirname, 'out/sw.js'),
            },
          ],
        })
      );
    }
    return config;
  },
};

export default nextConfig;
