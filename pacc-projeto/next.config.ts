import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  sassOptions: {
    // Isso permite que o Sass procure arquivos na pasta styles automaticamente
    includePaths: ["./src/styles"],
  },
  reactCompiler: true,
};

export default nextConfig;
