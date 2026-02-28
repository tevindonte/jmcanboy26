const fs = require('fs')
const path = require('path')

const map = [
  ['aboutme.jpg', '1.jpg'],
  ['business.PNG', '2.png'],
  ['credentials professions.jpg', '3.jpg'],
  ['socialmedia.jpg', '4.jpg'],
  ['motion.gif', '5.gif'],
  ['logo.jpg', '6.jpg'],
  ['intro.gif', '7.gif'],
  ['misc (5).jpg', '8.jpg'],
  ['model.jpg', '9.jpg'],
  ['photography.JPG', '10.jpg'],
  ['contact.jpg', '11.jpg'],
]

const root = path.join(__dirname, '..')
const src = path.join(root, 'ffsection1')
const dst = path.join(root, 'app', 'images')

map.forEach(([from, to]) => {
  const s = path.join(src, from)
  const d = path.join(dst, to)
  if (fs.existsSync(s)) {
    fs.copyFileSync(s, d)
    console.log(from, '->', to)
  }
})
