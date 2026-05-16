import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      "@prisma/client": "./node_modules/.prisma/client/index.js",
    },
  },
}

export default nextConfig
