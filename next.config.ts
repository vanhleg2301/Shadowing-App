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
  // AI & Tech had its own page, with its articles under it; saved links and notes still work.
  async redirects() {
    return [
      { source: "/news/ai-tech/:id(tc-\\d{8})", destination: "/news/article/:id", permanent: true },
      // Next decodes the destination once, so "&" is encoded twice to stay inside the topic.
      { source: "/news/ai-tech", destination: "/news?topic=AI+%2526+Tech", permanent: true },
    ];
  },
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
