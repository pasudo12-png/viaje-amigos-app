import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
  },
})
```

Presiona **Ctrl+S**, luego en el terminal:
```
git add -A
git commit -m "fix: explicit postcss config"
git push