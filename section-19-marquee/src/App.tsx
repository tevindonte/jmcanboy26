import "./App.css"

const LETTER_IMAGES = ["T.png", "E.png", "V.png", "I.png", "N.png"] as const
const REPEAT = 6 // TEVIN repeated 6x per track for seamless scroll

function LetterBlock({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="letter-block">
      <img src={src} alt={alt} className="letter-img" />
    </div>
  )
}

function App() {
  const track = [...Array(REPEAT)].flatMap(() => LETTER_IMAGES)
  return (
    <div className="marquee-demo">
      <div className="marquee-wrap">
        <div className="marquee-inner">
          <div className="marquee-track">
            {track.map((imgSrc, i) => (
              <LetterBlock key={i} src={`./assets/images/${imgSrc}`} alt={imgSrc[0]} />
            ))}
          </div>
          <div className="marquee-track" aria-hidden="true">
            {track.map((imgSrc, i) => (
              <LetterBlock key={`dup-${i}`} src={`./assets/images/${imgSrc}`} alt={imgSrc[0]} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
