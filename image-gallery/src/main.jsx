import { createRoot } from 'react-dom/client'
import { Router } from 'wouter'
import './styles.css'
import { App } from './App'

const images = [
  { position: [0, 0, 1.5], rotation: [0, 0, 0], url: './images/slide6-1.jpg', label: '1' },
  { position: [-0.95, 0, -0.6], rotation: [0, 0, 0], url: './images/slide6-2.jpg', label: '2' },
  { position: [0.95, 0, -0.6], rotation: [0, 0, 0], url: './images/slide6-3.jpg', label: '3' },
  { position: [-1.95, 0, 0.25], rotation: [0, Math.PI / 2.5, 0], url: './images/slide6-4.jpg', label: '4' },
  { position: [-2.4, 0, 1.5], rotation: [0, Math.PI / 2.5, 0], url: './images/slide6-5.jpg', label: '5' },
  { position: [-2.25, 0, 2.75], rotation: [0, Math.PI / 2.5, 0], url: './images/slide6-6.jpg', label: '6' },
  { position: [1.95, 0, 0.25], rotation: [0, -Math.PI / 2.5, 0], url: './images/slide6-7.jpg', label: '7' },
  { position: [2.4, 0, 1.5], rotation: [0, -Math.PI / 2.5, 0], url: './images/slide6-8.jpeg', label: '8' },
  { position: [2.25, 0, 2.75], rotation: [0, -Math.PI / 2.5, 0], url: './images/slide6-9.jpg', label: '9' }
]

createRoot(document.getElementById('root')).render(
  <Router>
    <App images={images} />
  </Router>
)
