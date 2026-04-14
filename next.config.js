/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  serverExternalPackages: ["better-sqlite3"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "treee.github.io" },
      { protocol: "https", hostname: "aoe2techtree.net" },
    ],
  },
};

module.exports = nextConfig;
