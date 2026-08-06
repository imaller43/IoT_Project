import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        host: '0.0.0.0', // Listen on all IPs
        cors: true,
        allowedHosts: true, // Allow all host headers (needed for Cloudflare Tunnel)
        proxy: {
            '/api': {
                target: 'http://10.12.27.21:8086',
                changeOrigin: true,
                secure: false,
            },
            '/mqtt': {
                target: 'ws://10.12.27.21:8083',
                ws: true,
                changeOrigin: true,
                secure: false,
            }
        }
    }
});
