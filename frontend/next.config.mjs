/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@creit.tech/stellar-wallets-kit"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "files.catbox.moe",
      },
      {
        protocol: "https",
        hostname: "**.example.com",
      },
    ],
  },
};

export default nextConfig;
