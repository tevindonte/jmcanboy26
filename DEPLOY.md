# Deployment Checklist

## Build
```bash
npm run build
```
Output: `InfiniteCircularGallery/`

## Pre-deploy
- [ ] Add all required images (credentials, aboutmepick, logos)
- [ ] Ensure `hongkong.glb` and `sky-red-flashback.jpg` in section-5-glb/public/
- [ ] Ensure `widen_1220x0.min.ply` in section-9-widen/public/
- [ ] Run full build: `npm run build`

## Deploy
- Upload contents of `InfiniteCircularGallery/` to your host
- Ensure server serves `index.html` for SPA-style routing (hash-based: `#section-6` etc.)
- No server-side config needed for hash routing

## Optimizations
- Loading screen shows until window load
- Iframes use `loading="lazy"`
- Interactive sections (3D) require click-to-activate
- Section transitions on vertical navigation
