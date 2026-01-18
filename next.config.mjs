/** @type {import('next').NextConfig} */
const isProd = process.env.NODE_ENV === "production";

const nextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**.supabase.co" }],
    unoptimized: !isProd,
  },

  reactStrictMode: false, // sudah benar: menghindari double render di dev
  productionBrowserSourceMaps: false, // sudah benar

  // 👉 Pindahkan lint & typecheck keluar dari siklus dev compile (jalankan manual/CI)
  eslint: { ignoreDuringBuilds: !isProd },
  typescript: { ignoreBuildErrors: !isProd },

  // 👉 Optimasi kompilasi & ukuran bundel
  compiler: {
    // aktifkan jika pakai styled-components; aman di-skip kalau tidak perlu
    styledComponents: true,
    // kecilkan noise di prod; di dev biarkan console utuh
    removeConsole: isProd ? { exclude: ["error", "warn"] } : false,
  },

  // 👉 Biarkan Turbopack dev berjalan default (jangan paksa webpack/babel)
  // Jika kamu punya .babelrc, pertimbangkan untuk dihapus kecuali benar-benar butuh.

  // 👉 Bikin import per-fungsi/ikon otomatis (kurangi beban parsing & HMR)
  modularizeImports: {
    lodash: { transform: "lodash/{{member}}" },
    "lodash-es": { transform: "lodash-es/{{member}}" },
    antd: { transform: "antd/es/{{member}}" }, // jika menimbulkan isu style, hapus baris ini
    "@ant-design/icons": {
      transform: "@ant-design/icons/{{member}}",
      skipDefaultConversion: true,
    },
    "date-fns": { transform: "date-fns/{{member}}" },
  },

  // 👉 Optimasi import paket populer (Next mendukung ini secara native)
  experimental: {
    optimizePackageImports: ["date-fns", "lodash-es", "lucide-react"],
  },

  // Cache header untuk aset WASM (sudah bagus)
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
