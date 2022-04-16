import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
			'components': path.resolve(__dirname, 'src/components'),
			'assets': path.resolve(__dirname, 'src/assets'),
			'utils': path.resolve(__dirname, 'src/utils'),
			'apis': path.resolve(__dirname, 'src/apis')
		},
	},
  build: {
		rollupOptions: {
			output:{
				manualChunks: {
					lodash: ['lodash'],
					react: ['react', 'react-dom', 'react-router-dom', 'echarts']
				}
        
			}
		}
	},
  css: {
		preprocessorOptions: {
			scss: {
				charset: false,
				additionalData: '@import "@/assets/css/_mixins.scss";'
			}
		}
	},
  server:{
    open: true
  }
})
