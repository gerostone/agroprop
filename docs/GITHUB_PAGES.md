# GitHub Pages (Demo estática)

Esta rama `Demo` está preparada para exportar un sitio estático sin backend.

## Build local
```bash
npm install
npm run build
```

El output queda en `out/`.

## Deploy en GitHub Pages
1. Configurar Pages en el repo:
   - Source: `GitHub Actions`.
2. Usar este workflow:

```yaml
name: Deploy Pages
on:
  push:
    branches: ["Demo"]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
          cache: npm
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: ./out
  deploy:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/deploy-pages@v4
```

## Notas
- `basePath` y `assetPrefix` están configurados a `/agroprop`.
- API Routes, Auth y DB quedan deshabilitados en esta demo.
