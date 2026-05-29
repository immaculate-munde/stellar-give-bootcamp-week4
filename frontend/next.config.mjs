/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@creit.tech/stellar-wallets-kit"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "files.catbox.moe" },
      { protocol: "https", hostname: "0x0.st" },
      { protocol: "https", hostname: "tmpfiles.org" },
      { protocol: "https", hostname: "i.imgur.com" },
      { protocol: "https", hostname: "media.istockphoto.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
