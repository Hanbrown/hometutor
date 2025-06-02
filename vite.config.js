import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue(), vueDevTools()],
    root: "client",
    publicDir: "client/public",
    build: {
        outDir: "../build",
    },
    server: {
        open: "client",
    },
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./client/src", import.meta.url)),
        },
    },
});
