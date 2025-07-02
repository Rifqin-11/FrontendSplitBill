/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/receipt/:path*", // semua request ke /api/receipt/…
        destination: "http://localhost:4000/api/receipt/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
