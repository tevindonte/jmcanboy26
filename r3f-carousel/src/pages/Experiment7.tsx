import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import Carousel from "../components/Carousel";

/**
 * Combined layout from Experiment 3 (fanned vertical carousels)
 * and Experiment 5 (horizontal stacked rows).
 */
const Experiment7 = () => {
  return (
    <>
      <Canvas
        style={{
          position: "fixed",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
          background: "#000",
        }}
        camera={{
          position: [0, 0, 2.8],
          rotation: [0, 0, Math.PI / 8],
        }}
      >
        <color attach="background" args={["#000000"]} />
        <Suspense fallback={null}>
          {/* From Exp3: 5 fanned vertical carousels (center) */}
          <Carousel
            imageSize={[0.7, 0.9]}
            gap={0}
            wheelFactor={0.25}
            position={[-1.2, 0, 0]}
            curveFrequency={0.4}
            curveStrength={0.9}
          />
          <Carousel
            imageSize={[0.7, 0.9]}
            gap={0}
            wheelFactor={0.35}
            position={[-0.6, 0, 0]}
            curveFrequency={0.4}
            curveStrength={0.6}
          />
          <Carousel
            imageSize={[0.7, 0.9]}
            gap={0}
            wheelFactor={0.45}
            curveFrequency={0.4}
            curveStrength={0}
          />
          <Carousel
            imageSize={[0.7, 0.9]}
            gap={0}
            wheelFactor={0.55}
            position={[0.6, 0, 0]}
            curveFrequency={0.4}
            curveStrength={-0.6}
          />
          <Carousel
            imageSize={[0.7, 0.9]}
            gap={0}
            wheelFactor={0.65}
            position={[1.2, 0, 0]}
            curveFrequency={0.4}
            curveStrength={-0.9}
          />

          {/* From Exp5: 3 horizontal rows (offset for depth) */}
          <group position={[0, 0.5, -0.3]}>
            <Carousel
              position={[0, -0.6, 0]}
              imageSize={[0.5, 0.5]}
              gap={0}
              wheelFactor={0.15}
              direction="horizontal"
              curveFrequency={0.9}
              curveStrength={0.4}
            />
            <Carousel
              position={[0, 0, 0]}
              imageSize={[0.5, 0.5]}
              gap={0}
              wheelFactor={0.1}
              direction="horizontal"
              curveFrequency={1}
              curveStrength={0.3}
            />
            <Carousel
              position={[0, 0.6, 0]}
              imageSize={[0.5, 0.5]}
              gap={0}
              wheelFactor={0.2}
              direction="horizontal"
              curveFrequency={1.1}
              curveStrength={0.25}
            />
          </group>
        </Suspense>
      </Canvas>
    </>
  );
};

export default Experiment7;
