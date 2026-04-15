/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    serverComponentsExternalPackages: ["better-sqlite3", "ws"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "treee.github.io" },
      { protocol: "https", hostname: "aoe2techtree.net" },
    ],
  },
};

module.exports = nextConfig;
