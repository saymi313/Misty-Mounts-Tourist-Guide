import { defineConfig, loadEnv } from 'vite'
import { renderHead } from './scripts/seo-output.mjs'
import { siteOrigin } from './src/data/seoPages.js'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const origin = siteOrigin(env.VITE_SITE_URL || 'https://www.mistymounts.pk');
  const indexable = env.VITE_SEO_INDEXABLE === 'true' && Boolean(env.VITE_API_URL);
  return {
  plugins: [react(), { name: 'initial-seo-head', transformIndexHtml: html => html.replace('<!-- seo-head -->', renderHead('/', origin, indexable)) }],
  build: {
    // Split big third-party libs into their own long-lived chunks so a repeat
    // visitor on a weak connection re-downloads only changed app code, not the
    // whole vendor payload. (Route pages are already lazy-loaded via React.lazy.)
    rollupOptions: {
      output: {
        // Only split the libraries loaded eagerly on (nearly) every page into
        // their own long-lived chunks. Everything else — especially the heavy
        // /discover semantic-search stack (@huggingface/transformers + onnxruntime)
        // and the /map Leaflet stack — is left to Rollup's default splitting so
        // it stays in a LAZY route chunk and never touches the first-paint
        // payload. (A catch-all "vendor" would wrongly pull onnxruntime eager.)
        manualChunks(id) {
          if (!id.includes('node_modules')) return
          if (id.includes('framer-motion') || id.includes('popmotion') || id.includes('/motion-dom/') || id.includes('/motion-utils/')) return 'motion'
          if (id.includes('react-router') || id.includes('/react-dom/') || id.includes('/react/') || id.includes('scheduler')) return 'react-vendor'
          if (id.includes('lucide-react') || id.includes('react-icons')) return 'icons'
        },
      },
    },
    chunkSizeWarningLimit: 900,
  },
  };
})
