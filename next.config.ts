import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "10.210.228.105",
    "192.168.86.179",
    "192.168.132.12",
    "192.168.86.178",
    "10.61.242.105"
  ],
  reactStrictMode: true,
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
})(nextConfig);