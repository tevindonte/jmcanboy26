import { defineConfig } from "vite";
import { resolve } from "path";
import glsl from "vite-plugin-glsl";

export default defineConfig({
  base: "./",
  plugins: [glsl()],
});
