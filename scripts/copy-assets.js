const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const assetsDir = path.join(root, 'public-assets')
const portfolioPublic = path.join(root, '..', 'portfolio', 'public')

// Check multiple locations for each asset
const plySources = [
  path.join(assetsDir, 'widen_1220x0.min.ply'),
  path.join(portfolioPublic, 'widen_1220x0.min.ply'),
]

const plyDest = path.join(root, 'section-9-widen', 'public', 'widen_1220x0.min.ply')
const widenPublicDir = path.dirname(plyDest)

if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true })
  fs.writeFileSync(path.join(assetsDir, 'README.txt'), 'Add model.glb and widen_1220x0.min.ply here (or keep widen_1220x0.min.ply in portfolio/public/)')
  console.log('Created public-assets/. Add model.glb and widen_1220x0.min.ply there.')
}

// Copy widen_1220x0.min.ply from whichever location has it
for (const src of plySources) {
  if (fs.existsSync(src)) {
    if (!fs.existsSync(widenPublicDir)) fs.mkdirSync(widenPublicDir, { recursive: true })
    fs.copyFileSync(src, plyDest)
    console.log('widen_1220x0.min.ply ->', path.relative(root, plyDest))
    break
  }
}

// Copy model.glb from public-assets
const glbSrc = path.join(assetsDir, 'model.glb')
const glbDest = path.join(root, 'section-5-glb', 'public', 'model.glb')
if (fs.existsSync(glbSrc)) {
  const glbDir = path.dirname(glbDest)
  if (!fs.existsSync(glbDir)) fs.mkdirSync(glbDir, { recursive: true })
  fs.copyFileSync(glbSrc, glbDest)
  console.log('model.glb ->', path.relative(root, glbDest))
}
