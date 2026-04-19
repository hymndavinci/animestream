/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" }
    ]
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https: http:",
              "font-src 'self' data: https:",
              "connect-src 'self' https: http:",
              "media-src 'self' https: http: blob:",
              "frame-src https://2embed.cc https://*.2embed.cc https://www.miruro.tv https://*.miruro.tv https://vidsrc.to https://*.vidsrc.to https://vidsrc.me https://*.vidsrc.me https://vidsrc.xyz https://*.vidsrc.xyz https://embed.su https://*.embed.su https://vidsrcme.ru https://*.vidsrcme.ru https://vsembed.ru https://*.vsembed.ru",
              "frame-ancestors *",
            ].join("; "),
          },
          {
            key: "X-Frame-Options",
            value: "ALLOWALL",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
