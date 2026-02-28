import * as THREE from 'three'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useCursor, MeshReflectorMaterial, Image, Text, Environment } from '@react-three/drei'
import { Router, useRoute, useLocation } from 'wouter'
import { easing } from 'maath'
import getUuid from 'uuid-by-string'

const GOLDENRATIO = 1.61803398875

export const App = ({ images }) => (
  <Canvas dpr={[1, 1.5]} camera={{ fov: 75, position: [0, 2, 15] }}>
    <color attach="background" args={['#191920']} />
    <fog attach="fog" args={['#191920', 0, 15]} />
    <group position={[0, -0.5, 0]}>
      <Frames images={images} />
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[50, 50]} />
        <MeshReflectorMaterial
          blur={[300, 100]}
          resolution={2048}
          mixBlur={1}
          mixStrength={80}
          roughness={1}
          depthScale={1.2}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#050505"
          metalness={0.5}
        />
      </mesh>
    </group>
    <Environment preset="city" />
  </Canvas>
)

function Frames({ images, q = new THREE.Quaternion(), p = new THREE.Vector3() }) {
  const ref = useRef()
  const clicked = useRef()
  const [, params] = useRoute('/item/:id')
  const [, setLocation] = useLocation()
  useEffect(() => {
    clicked.current = ref.current?.getObjectByName(params?.id)
    if (clicked.current) {
      clicked.current.parent.updateWorldMatrix(true, true)
      clicked.current.parent.localToWorld(p.set(0, GOLDENRATIO / 2, 1.25))
      clicked.current.parent.getWorldQuaternion(q)
    } else {
      p.set(0, 0, 5.5)
      q.identity()
    }
  })
  useFrame((state, dt) => {
    easing.damp3(state.camera.position, p, 0.4, dt)
    easing.dampQ(state.camera.quaternion, q, 0.4, dt)
  })
  return (
    <group
      ref={ref}
      onClick={(e) =>
        (e.stopPropagation(),
        setLocation(clicked.current === e.object ? '/' : '/item/' + e.object.name))
      }
      onPointerMissed={() => setLocation('/')}>
      {images.map((props) => (
        <Frame key={props.url} {...props} />
      ))}
    </group>
  )
}

function Frame({ url, label, c = new THREE.Color(), ...props }) {
  const image = useRef()
  const frame = useRef()
  const spotTarget = useRef()
  const spotlight = useRef()
  const [, params] = useRoute('/item/:id')
  const [hovered, hover] = useState(false)
  const name = getUuid(url)
  const isActive = params?.id === name
  useCursor(hovered)
  useLayoutEffect(() => {
    if (spotlight.current && spotTarget.current) {
      spotlight.current.target = spotTarget.current
    }
  }, [])
  useFrame((state, dt) => {
    // zoom 0.7 = show full image including tops, no cropping
    if (image.current?.material) {
      image.current.material.zoom = 0.7
    }
    if (image.current) {
      easing.damp3(
        image.current.scale,
        [
          0.85 * (!isActive && hovered ? 0.85 : 1),
          0.9 * (!isActive && hovered ? 0.905 : 1),
          1
        ],
        0.1,
        dt
      )
    }
    if (frame.current?.material) {
      easing.dampC(frame.current.material.color, hovered ? 'orange' : 'white', 0.1, dt)
    }
  })
  return (
    <group {...props}>
      {/* Museum-style spotlight above each frame */}
      <spotLight
        ref={spotlight}
        position={[0, GOLDENRATIO / 2 + 5, 4]}
        angle={Math.PI / 6}
        penumbra={0.4}
        intensity={1.5}
      />
      <group ref={spotTarget} position={[0, GOLDENRATIO / 2, 0.5]} />
      <mesh
        name={name}
        onPointerOver={(e) => (e.stopPropagation(), hover(true))}
        onPointerOut={() => hover(false)}
        scale={[1, GOLDENRATIO, 0.05]}
        position={[0, GOLDENRATIO / 2, 0]}>
        <boxGeometry />
        <meshStandardMaterial
          color="#151515"
          metalness={0.5}
          roughness={0.5}
          envMapIntensity={2}
        />
        <mesh ref={frame} raycast={() => null} scale={[0.9, 0.93, 0.9]} position={[0, 0, 0.2]}>
          <boxGeometry />
          <meshBasicMaterial toneMapped={false} fog={false} />
        </mesh>
        {/* scale 0.82 = breathing room / negative space so full composition is visible */}
        <group scale={[0.82, 0.82, 1]} position={[0, 0, 0.5]}>
          <Image raycast={() => null} ref={image} position={[0, 0, 0.2]} url={url} />
        </group>
      </mesh>
      <Text
        maxWidth={0.1}
        anchorX="left"
        anchorY="top"
        position={[0.55, GOLDENRATIO, 0]}
        fontSize={0.025}>
        {label ?? name.split('-').join(' ')}
      </Text>
    </group>
  )
}
