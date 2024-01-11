
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    root: 'src',
    assetsInclude: ['**/*.glb'],
    
    server: {
        port: 3000
    },

    plugins: [react()]
})