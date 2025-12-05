import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    // Determine API_KEY from process.env if available at build time, 
    // otherwise it will be undefined and rely on user input in the UI.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY) 
  }
});