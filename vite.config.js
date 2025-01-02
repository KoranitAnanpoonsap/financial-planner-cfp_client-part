import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/financial-planner-cfp_client-part/',
  build: {
    sourcemap: false, // Disable source maps to prevent 'eval' usage
    // Alternatively, you can set it to true or 'hidden', but false is safest for CSP
  },
})
