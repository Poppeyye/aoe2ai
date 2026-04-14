/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "treee.github.io" },
      { protocol: "https", hostname: "aoe2techtree.net" },
    ],
  },
};

module.exports = nextConfig;
