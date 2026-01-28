import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
      "@context": path.resolve(__dirname, "src/context"),
      // "@hooks": path.resolve(__dirname, "src/hooks"),
      // "@layout": path.resolve(__dirname, "src/components/layout"),
      "@pages": path.resolve(__dirname, "src/pages"),
    },
  },
});
