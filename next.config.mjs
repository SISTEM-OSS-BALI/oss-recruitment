/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co", // atau spesifik: "<project>.supabase.co"
      },
    ],
    // alternatif sederhana:
    // domains: ["<project>.supabase.co"],
  },
  reactStrictMode: false, // <— hentikan mount ganda di dev
  productionBrowserSourceMaps: false, // jangan kirim source map di prod
  // Header cache untuk aset OCR
  async headers() {
    return [
      {
        source: "/tesseract/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/tessdata/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
