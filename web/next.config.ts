import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // 디자인에서 사용된 Google AI 이미지 URL 허용
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
};

export default nextConfig;
