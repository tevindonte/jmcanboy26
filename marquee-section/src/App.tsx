import MarqueeAlongSvgPath from "./components/MarqueeAlongSvgPath"
import "./App.css"

const path =
  "M1 209.434C58.5872 255.935 387.926 325.938 482.583 209.434C600.905 63.8051 525.516 -43.2211 427.332 19.9613C329.149 83.1436 352.902 242.723 515.041 267.302C644.752 286.966 943.56 181.94 995 156.5"

const examples = Array.from({ length: 13 }, (_, i) => `Example ${i}`)

function App() {
  return (
    <div className="marquee-demo">
      <MarqueeAlongSvgPath
        path={path}
        viewBox="0 0 996 330"
        baseVelocity={5}
        slowdownOnHover={true}
        draggable={true}
        repeat={3}
        dragSensitivity={0.2}
        className="marquee-wrapper"
        responsive
        grabCursor
      >
        {examples.map((label, i) => (
          <div key={i} className="marquee-item">
            <span className="marquee-label">{label}</span>
          </div>
        ))}
      </MarqueeAlongSvgPath>
    </div>
  )
}

export default App
