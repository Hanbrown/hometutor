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
            },
        },
    },
    server: {
        open: "client",
        proxy: {
            "/api": {
                target: "http://localhost:8080",
                changeOrigin: true,
                secure: false,
                ws: true,
                configure: (proxy, _options) => {
                    proxy.on("error", (err, _req, _res) => {
                        console.log("proxy error", err);
                    });
                    // proxy.on("proxyReq", (proxyReq, req, _res) => {
                    //     console.log("Sending Request to the Target:", req.method, req.url);
                    // });
                    // proxy.on("proxyRes", (proxyRes, req, _res) => {
                    //     console.log(
                    //         "Received Response from the Target:",
                    //         proxyRes.statusCode,
                    //         req.url
                    //     );
                    // });
                },
            },
        },
    },
    resolve: {
        alias: {
            "@": fileURLToPath(new URL("./client/", import.meta.url)),
        },
    },
});
