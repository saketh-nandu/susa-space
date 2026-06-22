import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

// Color palette constants - rich champagne and ivory light-theme palette
const COLORS = {
  ivory: '#FFFDF0',         // Soft pristine creamy ivory main highlights
  champagne: '#E6D4B5',     // Warm gorgeous golden champagne accent
  deepChampagne: '#C8B091', // Midtone shaded champagne for shadows
  velvetCrimson: '#C15C49', // Warm rich terracotta crimson velvet collar
  whiteAccent: '#FFFFFF',   // Bright accents
  darkCharcoal: '#1A1715',  // Nose and eye features
};

interface NovaPetProps {
  animationState?: 'idle' | 'walk' | 'greet' | 'sit' | 'beg' | 'wag' | 'feed' | 'joy';
}

interface OutlinedBoxProps {
  args: [number, number, number];
  color: string;
  outlineColor?: string;
  position?: [number, number, number];
  rotation?: [number, number, number];
}

// Custom Outlined 3D Block Component to render a perfectly solid box with clean Minecraft-style edges
function OutlinedBox({
  args,
  color,
  outlineColor = '#94816C', // Luxurious warm neutral bronze-outline
  position = [0, 0, 0],
  rotation = [0, 0, 0]
}: OutlinedBoxProps) {
  const [w, h, d] = args;

  // Memoize geometry to optimize memory footprint
  const geom = useMemo(() => new THREE.BoxGeometry(w, h, d), [w, h, d]);
  const edges = useMemo(() => new THREE.EdgesGeometry(geom), [geom]);

  return (
    <group position={position} rotation={rotation}>
      {/* 1. Solid mesh representing the block in 3D */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={args} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.7} 
          metalness={0.05}
          side={THREE.DoubleSide} // Guarantees solidity/no hollow shells in all dimensions
        />
      </mesh>
      {/* 2. Visual crisp outline edges defining volume of the block */}
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={outlineColor} linewidth={1.5} />
      </lineSegments>
    </group>
  );
}

function DogModel({ animationState = 'idle' }: { animationState: string }) {
  // Pivot refs for animating limbs and parts
  const headGroupRef = useRef<THREE.Group>(null);
  const tailGroupRef = useRef<THREE.Group>(null);
  const bodyGroupRef = useRef<THREE.Group>(null);
  
  const legLFRef = useRef<THREE.Group>(null);
  const legRFRef = useRef<THREE.Group>(null);
  const legLBRef = useRef<THREE.Group>(null);
  const legRBRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Default base postures
    let tailSpeed = 4;
    let tailAmp = 0.35;
    let headBobSpeed = 2;
    let headBobAmp = 0.05;
    let legSwingSpeed = 8;
    let legSwingAmp = 0.5;
    let bodyBobSpeed = 2;
    let bodyBobAmp = 0.04;

    // Explicitly reset rotation/positions to safe defaults on each frame to ensure no state persistence
    if (headGroupRef.current) {
      headGroupRef.current.rotation.x = 0;
      headGroupRef.current.rotation.y = 0;
      headGroupRef.current.rotation.z = 0;
      headGroupRef.current.position.set(0, 0.45, 0.8);
    }
    if (tailGroupRef.current) {
      tailGroupRef.current.rotation.x = 0.3;
      tailGroupRef.current.rotation.y = 0;
      tailGroupRef.current.rotation.z = 0;
    }
    if (bodyGroupRef.current) {
      bodyGroupRef.current.position.set(0, 0.1, 0);
      bodyGroupRef.current.rotation.x = 0;
      bodyGroupRef.current.rotation.y = 0;
      bodyGroupRef.current.rotation.z = 0;
    }
    if (legLFRef.current) {
      legLFRef.current.rotation.x = 0;
      legLFRef.current.rotation.y = 0;
      legLFRef.current.rotation.z = 0;
    }
    if (legRFRef.current) {
      legRFRef.current.rotation.x = 0;
      legRFRef.current.rotation.y = 0;
      legRFRef.current.rotation.z = 0;
    }
    if (legLBRef.current) {
      legLBRef.current.rotation.x = 0;
      legLBRef.current.rotation.y = 0;
      legLBRef.current.rotation.z = 0;
    }
    if (legRBRef.current) {
      legRBRef.current.rotation.x = 0;
      legRBRef.current.rotation.y = 0;
      legRBRef.current.rotation.z = 0;
    }

    if (animationState === 'idle') {
      // Gentle idle breathing
      if (bodyGroupRef.current) {
        bodyGroupRef.current.position.y = 0.1 + Math.sin(time * bodyBobSpeed) * bodyBobAmp;
      }
      if (headGroupRef.current) {
        headGroupRef.current.rotation.x = Math.sin(time * headBobSpeed) * headBobAmp;
      }
      if (tailGroupRef.current) {
        tailGroupRef.current.rotation.y = Math.sin(time * tailSpeed) * tailAmp;
      }
      // Legs straight
      if (legLFRef.current) legLFRef.current.rotation.x = 0;
      if (legRFRef.current) legRFRef.current.rotation.x = 0;
      if (legLBRef.current) legLBRef.current.rotation.x = 0;
      if (legRBRef.current) legRBRef.current.rotation.x = 0;

    } else if (animationState === 'walk') {
      // Dynamic Minecraft walking swing
      if (bodyGroupRef.current) {
        bodyGroupRef.current.position.y = 0.1 + Math.abs(Math.sin(time * legSwingSpeed)) * -0.1;
      }
      if (headGroupRef.current) {
        headGroupRef.current.rotation.x = Math.sin(time * legSwingSpeed) * 0.08;
      }
      if (tailGroupRef.current) {
        tailGroupRef.current.rotation.y = Math.sin(time * legSwingSpeed * 1.5) * 0.4;
      }
      
      // Swing legs alternatively
      if (legLFRef.current) legLFRef.current.rotation.x = Math.sin(time * legSwingSpeed) * legSwingAmp;
      if (legRFRef.current) legRFRef.current.rotation.x = -Math.sin(time * legSwingSpeed) * legSwingAmp;
      if (legLBRef.current) legLBRef.current.rotation.x = -Math.sin(time * legSwingSpeed) * legSwingAmp * 0.8;
      if (legRBRef.current) legRBRef.current.rotation.x = Math.sin(time * legSwingSpeed) * legSwingAmp * 0.8;

    } else if (animationState === 'greet' || animationState === 'wag' || animationState === 'joy') {
      // Friendly, energetic greeting mode - tail wags ultra-fast, head rotates side-to-side
      if (bodyGroupRef.current) {
        bodyGroupRef.current.position.y = 0.1 + Math.sin(time * 12) * 0.05;
      }
      if (headGroupRef.current) {
        headGroupRef.current.rotation.y = Math.sin(time * 10) * 0.15; // happy head shaking/tilted look
        headGroupRef.current.rotation.z = Math.sin(time * 5) * 0.05;
      }
      if (tailGroupRef.current) {
        tailGroupRef.current.rotation.y = Math.sin(time * 24) * 0.75; // super fast wag
      }
      // Dynamic bouncy standing weight shift
      if (legLFRef.current) legLFRef.current.rotation.x = Math.sin(time * 12) * 0.15;
      if (legRFRef.current) legRFRef.current.rotation.x = -Math.sin(time * 12) * 0.15;
      if (legLBRef.current) legLBRef.current.rotation.x = 0;
      if (legRBRef.current) legRBRef.current.rotation.x = 0;

    } else if (animationState === 'sit') {
      // Cute stationary sit
      if (bodyGroupRef.current) {
        bodyGroupRef.current.position.y = -0.3; // resting lower
      }
      if (headGroupRef.current) {
        headGroupRef.current.rotation.x = -0.1; // head tilted up slightly to look at user
        headGroupRef.current.position.y = 0.25;
      }
      if (tailGroupRef.current) {
        tailGroupRef.current.rotation.x = -0.1;
        tailGroupRef.current.rotation.y = Math.sin(time * 2) * 0.1;
      }
      // Front legs forward, back legs curled up
      if (legLFRef.current) legLFRef.current.rotation.x = -0.4;
      if (legRFRef.current) legRFRef.current.rotation.x = -0.4;
      if (legLBRef.current) legLBRef.current.rotation.x = -1.2;
      if (legRBRef.current) legRBRef.current.rotation.x = -1.2;

    } else if (animationState === 'beg' || animationState === 'feed') {
      // Standing on hind legs begging
      if (bodyGroupRef.current) {
        bodyGroupRef.current.rotation.x = -0.8; // body tilted upwards
        bodyGroupRef.current.position.y = 0.4;
      }
      if (headGroupRef.current) {
        headGroupRef.current.rotation.x = 0.7; // head rotation to balance looking up
        headGroupRef.current.position.set(0, 0.75, 0.4);
      }
      if (tailGroupRef.current) {
        tailGroupRef.current.rotation.x = -0.4;
        tailGroupRef.current.rotation.y = Math.sin(time * 12) * 0.4;
      }
      // Front legs limp/begging rotation, back legs supporting
      if (legLFRef.current) legLFRef.current.rotation.x = 1.2 + Math.sin(time * 6) * 0.2;
      if (legRFRef.current) legRFRef.current.rotation.x = 1.2 - Math.sin(time * 6) * 0.2;
      if (legLBRef.current) legLBRef.current.rotation.x = -0.3;
      if (legRBRef.current) legRBRef.current.rotation.x = -0.3;
    }
  });

  return (
    <group ref={bodyGroupRef}>
      {/* 1. Torso body of the dog (Solid Outlined Blocks) */}
      <OutlinedBox 
        args={[1.3, 1.3, 2.4]} 
        color={COLORS.ivory} 
        outlineColor={COLORS.deepChampagne} 
        position={[0, 0, 0]} 
      />

      {/* 2. Soft fluffy neck/shoulder fluff (Mane) */}
      <OutlinedBox 
        args={[1.5, 1.5, 1.1]} 
        color={COLORS.whiteAccent} 
        outlineColor={COLORS.deepChampagne} 
        position={[0, 0.4, 0.75]} 
      />

      {/* 3. Collar - velvet crimson around neck */}
      <OutlinedBox 
        args={[1.35, 1.35, 0.25]} 
        color={COLORS.velvetCrimson} 
        outlineColor="#A04031" 
        position={[0, 0.15, 1.35]} 
      />

      {/* 4. Elegant golden ID Tag dangling from collar */}
      <OutlinedBox 
        args={[0.2, 0.2, 0.05]} 
        color="#E6B85C" 
        outlineColor="#B58F2C" 
        position={[0, -0.65, 1.45]} 
        rotation={[0, 0, Math.PI / 4]} 
      />

      {/* 5. Hierarchical Head Group rotates at neck pivot */}
      <group ref={headGroupRef} position={[0, 0.45, 0.8]}>
        {/* Main Head Skull Box */}
        <OutlinedBox 
          args={[1.1, 1.1, 1.1]} 
          color={COLORS.ivory} 
          outlineColor={COLORS.deepChampagne} 
          position={[0, 0.5, 0.55]} 
        />

        {/* Snout/Muzzle front part */}
        <OutlinedBox 
          args={[0.6, 0.6, 0.5]} 
          color={COLORS.champagne} 
          outlineColor={COLORS.deepChampagne} 
          position={[0, 0.25, 1.2]} 
        />

        {/* Real black nose tip */}
        <OutlinedBox 
          args={[0.25, 0.2, 0.1]} 
          color={COLORS.darkCharcoal} 
          outlineColor="#000000" 
          position={[0, 0.45, 1.46]} 
        />

        {/* Eyes (Left & Right solid boxes) */}
        <OutlinedBox 
          args={[0.12, 0.25, 0.1]} 
          color={COLORS.darkCharcoal} 
          outlineColor="#000000" 
          position={[-0.45, 0.6, 1.06]} 
        />
        <OutlinedBox 
          args={[0.12, 0.25, 0.1]} 
          color={COLORS.darkCharcoal} 
          outlineColor="#000000" 
          position={[0.45, 0.6, 1.06]} 
        />

        {/* Left Ear block */}
        <OutlinedBox 
          args={[0.25, 0.4, 0.25]} 
          color={COLORS.champagne} 
          outlineColor={COLORS.deepChampagne} 
          position={[-0.5, 1.1, 0.45]} 
        />

        {/* Right Ear block */}
        <OutlinedBox 
          args={[0.25, 0.4, 0.25]} 
          color={COLORS.champagne} 
          outlineColor={COLORS.deepChampagne} 
          position={[0.5, 1.1, 0.45]} 
        />
      </group>

      {/* 6. Back Tail block swings */}
      <group ref={tailGroupRef} position={[0, 0.4, -1.25]}>
        <OutlinedBox 
          args={[0.25, 0.25, 0.9]} 
          color={COLORS.champagne} 
          outlineColor={COLORS.deepChampagne} 
          position={[0, 0, -0.45]} 
        />
      </group>

      {/* FOUR PIVOTABLE LEGS with Outlived Box solid volume */}
      {/* Front Left Leg */}
      <group ref={legLFRef} position={[-0.45, -0.5, 0.7]}>
        <OutlinedBox 
          args={[0.35, 1.0, 0.35]} 
          color={COLORS.ivory} 
          outlineColor={COLORS.deepChampagne} 
          position={[0, -0.5, 0]} 
        />
        <OutlinedBox 
          args={[0.35, 0.2, 0.45]} 
          color={COLORS.champagne} 
          outlineColor={COLORS.deepChampagne} 
          position={[0, -0.9, 0.1]} 
        />
      </group>

      {/* Front Right Leg */}
      <group ref={legRFRef} position={[0.45, -0.5, 0.7]}>
        <OutlinedBox 
          args={[0.35, 1.0, 0.35]} 
          color={COLORS.ivory} 
          outlineColor={COLORS.deepChampagne} 
          position={[0, -0.5, 0]} 
        />
        <OutlinedBox 
          args={[0.35, 0.2, 0.45]} 
          color={COLORS.champagne} 
          outlineColor={COLORS.deepChampagne} 
          position={[0, -0.9, 0.1]} 
        />
      </group>

      {/* Back Left Leg */}
      <group ref={legLBRef} position={[-0.45, -0.5, -0.7]}>
        <OutlinedBox 
          args={[0.35, 1.0, 0.35]} 
          color={COLORS.ivory} 
          outlineColor={COLORS.deepChampagne} 
          position={[0, -0.5, 0]} 
        />
        <OutlinedBox 
          args={[0.35, 0.2, 0.4]} 
          color={COLORS.champagne} 
          outlineColor={COLORS.deepChampagne} 
          position={[0, -0.9, -0.05]} 
        />
      </group>

      {/* Back Right Leg */}
      <group ref={legRBRef} position={[0.45, -0.5, -0.7]}>
        <OutlinedBox 
          args={[0.35, 1.0, 0.35]} 
          color={COLORS.ivory} 
          outlineColor={COLORS.deepChampagne} 
          position={[0, -0.5, 0]} 
        />
        <OutlinedBox 
          args={[0.35, 0.2, 0.4]} 
          color={COLORS.champagne} 
          outlineColor={COLORS.deepChampagne} 
          position={[0, -0.9, -0.05]} 
        />
      </group>
    </group>
  );
}

// Low-Poly blocky garden platform for Nova to stand in
function LowPolyGarden() {
  return (
    <group position={[0, 0, 0]}>
      {/* 1. Minecraft-Style green lawn grass platform (chunky block) */}
      <OutlinedBox
        args={[14, 0.4, 10]}
        color="#83B265" // Beautiful premium spring green
        outlineColor="#5C8542" // Outline grass edge
        position={[0, -0.9, 0]}
      />

      {/* 2. Layer of dark fertile cocoa soil/dirt layer beneath */}
      <OutlinedBox
        args={[14, 0.4, 10]}
        color="#8E6346" // Warm cocoa brown
        outlineColor="#62412D" // Outline dirt edge
        position={[0, -1.3, 0]}
      />

      {/* 3. Pixel-Art Cozy Doghouse */}
      <group position={[3.2, -0.7, -2.2]}>
        {/* Base / Walls */}
        <OutlinedBox 
          args={[1.6, 1.3, 1.6]} 
          color="#A8623D" 
          outlineColor="#733B1D" 
          position={[0, 0.4, 0]} 
        />
        {/* Slanted Roof */}
        <OutlinedBox 
          args={[1.9, 0.3, 1.9]} 
          color="#D44B4B" 
          outlineColor="#962A2A" 
          position={[0, 1.2, 0]} 
        />
        {/* Entrance opening */}
        <OutlinedBox 
          args={[0.7, 0.85, 0.05]} 
          color="#221C19" 
          outlineColor="#110D0B" 
          position={[0, 0.15, 0.81]} 
        />
        {/* Doghouse Name Plate */}
        <OutlinedBox 
          args={[0.6, 0.2, 0.04]} 
          color="#FCEAB3" 
          outlineColor="#B09041" 
          position={[0, 0.8, 0.81]} 
        />
      </group>

      {/* 4. Large Sparkling Swimming Pond */}
      <group position={[-3.5, -0.69, -1.5]}>
        {/* Sparkly Blue Pond */}
        <OutlinedBox 
          args={[4.0, 0.05, 3.0]} 
          color="#4C96E6" 
          outlineColor="#2C69AB" 
          position={[0, 0, 0]} 
        />
        {/* Small Lillypad */}
        <OutlinedBox 
          args={[0.6, 0.02, 0.6]} 
          color="#427830" 
          outlineColor="#2B511F" 
          position={[0.8, 0.035, 0.3]} 
        />
        {/* Lotus Bloom on Lillypad */}
        <OutlinedBox 
          args={[0.2, 0.1, 0.2]} 
          color="#E66597" 
          outlineColor="#A12752" 
          position={[0.8, 0.09, 0.3]} 
        />
      </group>

      {/* 5. Blocky Playground Toy Bone */}
      <group position={[-1.2, -0.68, 1.8]}>
        {/* Bone Shaft */}
        <OutlinedBox args={[0.7, 0.08, 0.2]} color="#FAF9F5" outlineColor="#C2C0B8" position={[0, 0, 0]} />
        {/* Bone Ends */}
        <OutlinedBox args={[0.25, 0.12, 0.32]} color="#FAF9F5" outlineColor="#C2C0B8" position={[-0.35, 0, 0.1]} />
        <OutlinedBox args={[0.25, 0.12, 0.32]} color="#FAF9F5" outlineColor="#C2C0B8" position={[-0.35, 0, -0.1]} />
        <OutlinedBox args={[0.25, 0.12, 0.32]} color="#FAF9F5" outlineColor="#C2C0B8" position={[0.35, 0, 0.1]} />
        <OutlinedBox args={[0.25, 0.12, 0.32]} color="#FAF9F5" outlineColor="#C2C0B8" position={[0.35, 0, -0.1]} />
      </group>

      {/* 6. Grand Oak Shade Tree */}
      <group position={[-4.0, -0.7, 2.5]}>
        {/* Trunk */}
        <OutlinedBox 
          args={[0.5, 2.4, 0.5]} 
          color="#7D5230" 
          outlineColor="#4F3119" 
          position={[0, 1.0, 0]} 
        />
        {/* Foliage blocks */}
        <OutlinedBox 
          args={[2.2, 1.8, 2.2]} 
          color="#4B7D3A" 
          outlineColor="#2E5421" 
          position={[0, 2.8, 0]} 
        />
        <OutlinedBox 
          args={[1.5, 1.2, 1.5]} 
          color="#5F9C4A" 
          outlineColor="#2E5421" 
          position={[0.3, 3.4, -0.2]} 
        />
      </group>

      {/* 7. Tiny Birch Sapling Tree */}
      <group position={[4.0, -0.7, 2.2]}>
        {/* Trunk */}
        <OutlinedBox 
          args={[0.3, 1.6, 0.3]} 
          color="#EBECE6" 
          outlineColor="#9FA198" 
          position={[0, 0.6, 0]} 
        />
        {/* Foilage */}
        <OutlinedBox 
          args={[1.4, 1.4, 1.4]} 
          color="#6EAA55" 
          outlineColor="#457332" 
          position={[0, 1.8, 0]} 
        />
      </group>

      {/* 8. Front Wooden Gate/Fence Post Details */}
      <group position={[0, -0.7, 4.4]}>
        <OutlinedBox args={[0.2, 0.8, 0.2]} color="#B38A64" outlineColor="#7A5A3D" position={[-2.5, 0.2, 0]} />
        <OutlinedBox args={[2.0, 0.15, 0.08]} color="#C29870" outlineColor="#7A5A3D" position={[-1.5, 0.35, 0]} />
        <OutlinedBox args={[0.2, 0.8, 0.2]} color="#B38A64" outlineColor="#7A5A3D" position={[-0.5, 0.2, 0]} />
        
        <OutlinedBox args={[0.2, 0.8, 0.2]} color="#B38A64" outlineColor="#7A5A3D" position={[0.5, 0.2, 0]} />
        <OutlinedBox args={[2.0, 0.15, 0.08]} color="#C29870" outlineColor="#7A5A3D" position={[1.5, 0.35, 0]} />
        <OutlinedBox args={[0.2, 0.8, 0.2]} color="#B38A64" outlineColor="#7A5A3D" position={[2.5, 0.2, 0]} />
      </group>

      {/* Back Fences */}
      <group position={[0, -0.7, -4.4]}>
        <OutlinedBox args={[0.2, 0.8, 0.2]} color="#B38A64" outlineColor="#7A5A3D" position={[-4.5, 0.2, 0]} />
        <OutlinedBox args={[2.0, 0.15, 0.08]} color="#C29870" outlineColor="#7A5A3D" position={[-3.5, 0.35, 0]} />
        <OutlinedBox args={[0.2, 0.8, 0.2]} color="#B38A64" outlineColor="#7A5A3D" position={[-2.5, 0.2, 0]} />
        <OutlinedBox args={[2.0, 0.15, 0.08]} color="#C29870" outlineColor="#7A5A3D" position={[-1.5, 0.35, 0]} />
        <OutlinedBox args={[0.2, 0.8, 0.2]} color="#B38A64" outlineColor="#7A5A3D" position={[-0.5, 0.2, 0]} />
        
        <OutlinedBox args={[0.2, 0.8, 0.2]} color="#B38A64" outlineColor="#7A5A3D" position={[0.5, 0.2, 0]} />
        <OutlinedBox args={[2.0, 0.15, 0.08]} color="#C29870" outlineColor="#7A5A3D" position={[1.5, 0.35, 0]} />
        <OutlinedBox args={[0.2, 0.8, 0.2]} color="#B38A64" outlineColor="#7A5A3D" position={[2.5, 0.2, 0]} />
        <OutlinedBox args={[2.0, 0.15, 0.08]} color="#C29870" outlineColor="#7A5A3D" position={[3.5, 0.35, 0]} />
        <OutlinedBox args={[0.2, 0.8, 0.2]} color="#B38A64" outlineColor="#7A5A3D" position={[4.5, 0.2, 0]} />
      </group>

      {/* 9. Rich Scatter Pebbles & flower accents */}
      {/* Little grey stones */}
      <OutlinedBox args={[0.3, 0.15, 0.45]} color="#BEB9B0" outlineColor="#969188" position={[1.6, -0.625, 1.3]} />
      <OutlinedBox args={[0.2, 0.1, 0.2]} color="#9D9991" outlineColor="#7C7872" position={[1.8, -0.65, 0.9]} />
      
      {/* Bright Tulip */}
      <group position={[-1.3, -0.7, -1.3]}>
        <OutlinedBox args={[0.08, 0.5, 0.08]} color="#5A8F43" outlineColor="#3F672E" position={[0, 0.25, 0]} />
        <OutlinedBox args={[0.22, 0.22, 0.22]} color="#D64545" outlineColor="#A12727" position={[0, 0.5, 0]} />
        <OutlinedBox args={[0.1, 0.1, 0.1]} color="#F2C14E" outlineColor="#A12727" position={[0, 0.61, 0]} />
      </group>

      {/* Sweet Golden Dandelion */}
      <group position={[1.4, -0.7, 0.7]}>
        <OutlinedBox args={[0.08, 0.35, 0.08]} color="#5A8F43" outlineColor="#3F672E" position={[0, 0.175, 0]} />
        <OutlinedBox args={[0.25, 0.18, 0.25]} color="#F0B23E" outlineColor="#B47F23" position={[0, 0.37, 0]} />
      </group>

      {/* Whimsical Orchid */}
      <group position={[-1.4, -0.7, 1.2]}>
        <OutlinedBox args={[0.08, 0.6, 0.08]} color="#5A8F43" outlineColor="#3F672E" position={[0, 0.3, 0]} />
        <OutlinedBox args={[0.22, 0.22, 0.22]} color="#429AD6" outlineColor="#246794" position={[0, 0.6, 0]} />
        <OutlinedBox args={[0.3, 0.08, 0.08]} color="#6FBEED" outlineColor="#246794" position={[0, 0.6, 0]} />
      </group>
    </group>
  );
}

export default function NovaPet({ animationState = 'idle' }: NovaPetProps) {
  const [internalAction, setInternalAction] = useState<'idle' | 'walk' | 'greet' | 'sit' | 'beg' | 'wag' | 'feed' | 'joy'>('idle');

  // Sync external feeds or interaction commands (such as feed or joy)
  useEffect(() => {
    setInternalAction(animationState);
  }, [animationState]);

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      {/* 3D Canvas Workspace */}
      <div className="relative bg-[#F4F1EA] border border-[#E5E1D8] w-full h-[400px] lg:h-[480px] rounded-[36px] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
        <Canvas
          shadows
          camera={{ position: [4.2, 3.5, 6.0], fov: 45 }}
          style={{ width: '100%', height: '100%' }}
        >
          {/* soft environment coloring (sky blue aesthetic) - contrasts beautifully with garden lawn */}
          <color attach="background" args={['#EDF4F2']} />
          
          {/* Highly balanced ambient & directional studio lighting for clear depth perception */}
          <ambientLight intensity={0.8} />
          
          <directionalLight
            position={[6, 9, 4]}
            intensity={1.8}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-bias={-0.0001}
          />
          
          <pointLight position={[-4, -1, -5]} intensity={0.4} />

          {/* Render the core solid dog model */}
          <group position={[0, 0.3, 0]}>
            <DogModel animationState={internalAction} />
          </group>

          {/* Render the low-poly Minecraft style Garden platform */}
          <LowPolyGarden />

          {/* Smooth shadow projected onto the top grass surface (y = -0.7) */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.695, 0]} receiveShadow>
            <planeGeometry args={[10, 10]} />
            <shadowMaterial opacity={0.16} />
          </mesh>

          <OrbitControls 
            enableZoom={true} 
            enablePan={false} 
            minDistance={2} 
            maxDistance={15} 
            maxPolarAngle={Math.PI / 2 - 0.05} // prevent going fully under floor
          />
        </Canvas>

        {/* Interactive Floating overlays */}
        <span className="absolute top-3 left-1/2 -translate-x-1/2 text-[8px] uppercase tracking-[0.25em] font-mono text-[#7C7872] pointer-events-none select-none bg-white/80 px-3 py-1 rounded-full border border-stone-200 shadow-3xs font-semibold">
          Drag to Rotate Dog
        </span>
        
        <div className="absolute bottom-3 right-3 bg-white/80 border border-stone-100 rounded-lg py-0.5 px-2 text-[8.5px] font-mono text-stone-500 pointer-events-none select-none">
          3D Canvas
        </div>
      </div>

      {/* Animation Command Deck */}
      <div className="grid grid-cols-3 gap-1.5 w-full max-w-[280px]">
        {[
          { code: 'idle', icon: '🐕', label: 'Idle' },
          { code: 'walk', icon: '🐾', label: 'Walk' },
          { code: 'greet', icon: '👋', label: 'Greet' },
          { code: 'sit', icon: '🍗', label: 'Sit' },
          { code: 'beg', icon: '🥺', label: 'Beg' },
          { code: 'wag', icon: '⚡', label: 'Wag' }
        ].map((item) => (
          <button
            key={item.code}
            onClick={() => setInternalAction(item.code as any)}
            className={`py-1.5 px-1 text-[10px] rounded-xl transition-all border font-semibold flex flex-col items-center gap-0.5 ${
              internalAction === item.code 
                ? 'bg-[#A68F6C] text-white border-[#A68F6C] shadow-sm' 
                : 'bg-white text-[#1C1C1C] border-[#E5E1D8] hover:bg-neutral-50 shadow-3xs'
            }`}
          >
            <span className="text-xs">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
