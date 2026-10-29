import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    remotePatterns: [
      new URL("https://i.ytimg.com/vi/**"),
      new URL("https://lh3.googleusercontent.com/**"),
      // Covers for hosted-audio lessons (src/lib/media.ts).
      ...(supabaseUrl ? [new URL(`${supabaseUrl}/storage/v1/object/public/lesson-media/**`)] : []),
    ],
  },
  partialPrefetching: true,
  // Admin -> Theme uploads the app icon and link-preview image through a server action.
  experimental: { serverActions: { bodySizeLimit: "6mb" } },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
