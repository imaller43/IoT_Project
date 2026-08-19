import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            strategies: 'injectManifest',
            srcDir: 'src',
            filename: 'firebase-messaging-sw.js',
            registerType: 'autoUpdate',
            injectManifest: {
                injectionPoint: 'self.__WB_MANIFEST',
            },
            includeAssets: ['favicon.png'],
            manifest: {
                name: 'IoT Dashboard',
                short_name: 'IoT Dashboard',
                description: 'Dashboard Kawalan IoT dan Pemantauan Masa Nyata',
                theme_color: '#121212',
                background_color: '#121212',
                display: 'standalone',
                icons: [
                    {
                        src: '/favicon.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: '/favicon.png',
                        sizes: '512x512',
                        type: 'image/png'
                    },
                    {
                        src: '/favicon.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            }
        })
    ],
    server: {
        host: '0.0.0.0', // Listen on all IPs
        cors: true,
        allowedHosts: true, // Allow all host headers (needed for Cloudflare Tunnel)
        proxy: {
            '/api/mqtt': {
                target: 'ws://10.12.27.21:8083',
                ws: true,
                changeOrigin: true,
                secure: false,
            }
        }
    }
});
