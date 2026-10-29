import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// GitHub Pages serves this project from /<repository-name>/
export default defineConfig({
  base: "/pricing-competitor-dashboard/",
  plugins: [react(), tailwindcss()],
});
