import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// base must match the repo name so assets resolve at
// https://<user>.github.io/nubyen-ops/
export default defineConfig({
  plugins: [react()],
  base: "/nubyen-ops/",
});
