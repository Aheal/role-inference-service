import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  root: "frontend",
  plugins: [react()],
  server: {
    proxy: {
      "/health": "http://localhost:3000",
      "/roles": "http://localhost:3000",
      "/profiles": "http://localhost:3000"
    }
  },
  build: {
    outDir: "../dist/frontend",
    emptyOutDir: true
  }
});
