import withBundleAnalyzer from "@next/bundle-analyzer";

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Tree-shake and optimize heavy barrel files for instant compile and minimal bundles
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "@xyflow/react",
      "sonner",
      "clsx",
      "tailwind-merge",
    ],
    // Ensure server-only packages are externalized and not bundled into client bundles
    serverComponentsExternalPackages: ["mongoose"],
  },
};

export default bundleAnalyzer(nextConfig);
