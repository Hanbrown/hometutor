import { resolve } from "node:path";
import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue(), vueDevTools()],
    root: "client",
    publicDir: "client",
    build: {
        outDir: "../build",
        rollupOptions: {
            input: {
                main: resolve("client", "index.html"),
                manage: resolve("client", "manage.html"),
            }
        }
    },
    server: {
        open: "client",
    },
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./client/", import.meta.url)),
        },
    },
});
