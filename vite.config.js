import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Cloudflare Pages serves at the root, so base is "/".
// (On GitHub Pages this was "/nubyen-ops/". If you ever move back,
// change it back to "/nubyen-ops/".)
export default defineConfig({
  plugins: [react()],
  base: "/",
});
