import React, { useRef, useEffect, useState } from 'react';

// Define a 3D points interface
interface Point3D {
  x: number;
  y: number;
  z: number;
}

// Face structure containing indices of vertices, base color, and label
interface Face {
  indices: number[];
  color: string;
  outlineColor?: string;
}

export default function ThreeDDog({ animationState = 'idle' }: { animationState?: 'idle' | 'feed' | 'joy' }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Interactive rotation angle offsets
  const [rotation, setRotation] = useState({ theta: -0.5, phi: 0.3 }); // Radians
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const rotationStart = useRef({ theta: 0, phi: 0 });
  const [dogAction, setDogAction] = useState<'idle' | 'walk' | 'greet' | 'sit' | 'beg' | 'wag'>('idle');

  // Track cursor coordinates for the dog's responsive look-at direction
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMoveGlobal = (e: MouseEvent) => {
      // Normalize mouse coordinates around the window center
      const nx = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
      const ny = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
      setMousePos({ x: nx, y: ny });
    };
    window.addEventListener('mousemove', handleMouseMoveGlobal);
    return () => window.removeEventListener('mousemove', handleMouseMoveGlobal);
  }, []);

  // Primary loop for rendering the 3D dog
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let time = 0;

    // Define 3D scale and center offset
    const scale = 14; 
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2 + 10;

    const render = () => {
      time += 0.04;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Animation parameters
      let tailAngle = Math.sin(time * 10) * 0.3;
      let leftLegAngle = 0;
      let rightLegAngle = 0;
      let leftBackLegAngle = 0;
      let rightBackLegAngle = 0;
      let headBob = Math.sin(time * 2) * 0.05;
      let bodyBob = 0;

      // Handle override states from parent companion actions
      let activeAction = dogAction;
      if (animationState === 'feed') {
        activeAction = 'walk';
      } else if (animationState === 'joy') {
        activeAction = 'greet';
      }

      if (activeAction === 'idle') {
        bodyBob = Math.sin(time * 2) * 0.1;
        headBob = Math.sin(time * 2) * 0.05;
        tailAngle = Math.sin(time * 4) * 0.25;
        leftLegAngle = 0;
        rightLegAngle = 0;
        leftBackLegAngle = 0;
        rightBackLegAngle = 0;
      } else if (activeAction === 'walk') {
        bodyBob = Math.abs(Math.sin(time * 8)) * -0.5 - 0.2;
        headBob = Math.sin(time * 8) * 0.12;
        tailAngle = Math.sin(time * 16) * 0.55;
        leftLegAngle = Math.sin(time * 8) * 0.6;
        rightLegAngle = -Math.sin(time * 8) * 0.6;
        leftBackLegAngle = -Math.sin(time * 8) * 0.5;
        rightBackLegAngle = Math.sin(time * 8) * 0.5;
      } else if (activeAction === 'greet') {
        bodyBob = 2.0;
        headBob = -0.1 + Math.sin(time * 6) * 0.12;
        tailAngle = Math.sin(time * 24) * 0.75;
        leftLegAngle = -0.4;
        leftBackLegAngle = -0.8;
        rightBackLegAngle = -0.8;
        rightLegAngle = -1.8 + Math.sin(time * 15) * 0.45; // friendly waving arm greeting
      } else if (activeAction === 'sit') {
        bodyBob = 3.5;
        leftLegAngle = -0.5;
        rightLegAngle = -0.5;
        leftBackLegAngle = -1.0;
        rightBackLegAngle = -1.0;
        headBob = 0.12;
        tailAngle = Math.sin(time * 6) * 0.2;
      } else if (activeAction === 'beg') {
        bodyBob = -2.0;
        leftLegAngle = -1.4;
        rightLegAngle = -1.4;
        leftBackLegAngle = 0.2;
        rightBackLegAngle = 0.2;
        tailAngle = Math.sin(time * 16) * 0.45;
        headBob = Math.sin(time * 4) * 0.08;
      } else if (activeAction === 'wag') {
        bodyBob = Math.sin(time * 6) * 0.08;
        tailAngle = Math.sin(time * 28) * 0.85;
        headBob = Math.sin(time * 6) * 0.15;
        leftLegAngle = 0;
        rightLegAngle = 0;
        leftBackLegAngle = 0;
        rightBackLegAngle = 0;
      }

      // Base Minecraft dog color theme (Luxurious ivory/sand palette)
      const baseMainColor = '#E3DFD5'; // Premium light stone/grey wolf base
      const baseDarkColor = '#C2BEB3'; // Shadowed sandstone
      const baseLightColor = '#F2EFEB'; // Soft ivory Highlights
      const eyeColor = '#1C1C1C';
      const secondaryEyeColor = '#000000';
      const collarColor = '#D14D4D'; // Iconic Minecraft red collar in beautiful velvet crimson
      const tagColor = '#D4AF37'; // Real gold brass tag

      // List of 3D parts
      // A part is represented by its local scale, local position, rotation, and coloring
      interface ModelPart {
        vertices: Point3D[];
        faces: Face[];
      }

      const parts: ModelPart[] = [];

      // Helper to generate a 3D box (cuboid) centered at an offset
      const createBox = (
        w: number, h: number, d: number, 
        ox: number, oy: number, oz: number, 
        colors: { main: string; shadeY?: string; shadeX?: string; shadeZ?: string; outline?: string },
        rotations?: { rx: number; ry: number; rz: number }
      ): ModelPart => {
        // 8 points of the block
        let localVerts: Point3D[] = [
          { x: -w/2, y: -h/2, z: -d/2 },
          { x:  w/2, y: -h/2, z: -d/2 },
          { x:  w/2, y:  h/2, z: -d/2 },
          { x: -w/2, y:  h/2, z: -d/2 },
          { x: -w/2, y: -h/2, z:  d/2 },
          { x:  w/2, y: -h/2, z:  d/2 },
          { x:  w/2, y:  h/2, z:  d/2 },
          { x: -w/2, y:  h/2, z:  d/2 },
        ];

        // Apply local rotation if specified
        if (rotations) {
          const { rx, ry, rz } = rotations;
          localVerts = localVerts.map(v => {
            // Roll (Z)
            let x1 = v.x * Math.cos(rz) - v.y * Math.sin(rz);
            let y1 = v.x * Math.sin(rz) + v.y * Math.cos(rz);
            let z1 = v.z;

            // Pitch (X)
            let x2 = x1;
            let y2 = y1 * Math.cos(rx) - z1 * Math.sin(rx);
            let z2 = y1 * Math.sin(rx) + z1 * Math.cos(rx);

            // Yaw (Y)
            let x3 = x2 * Math.cos(ry) + z2 * Math.sin(ry);
            let y3 = y2;
            let z3 = -x2 * Math.sin(ry) + z2 * Math.cos(ry);

            return { x: x3, y: y3, z: z3 };
          });
        }

        // Apply offsets
        localVerts = localVerts.map(v => ({ x: v.x + ox, y: v.y + oy, z: v.z + oz }));

        const cMain = colors.main;
        const cY = colors.shadeY || cMain;
        const cX = colors.shadeX || cMain;
        const cZ = colors.shadeZ || cMain;

        // 6 faces of the cuboid
        const faces: Face[] = [
          { indices: [0, 1, 2, 3], color: cZ }, // Front
          { indices: [1, 5, 6, 2], color: cX }, // Right side
          { indices: [4, 5, 6, 7], color: cZ }, // Back
          { indices: [0, 4, 7, 3], color: cX }, // Left side
          { indices: [0, 1, 5, 4], color: cY }, // Top
          { indices: [3, 2, 6, 7], color: cY }, // Bottom
        ];

        return { vertices: localVerts, faces };
      };

      // 1. Classical Minecraft Body (Main abdomen)
      parts.push(createBox(1.8, 1.8, 3.2, 0, 1.2 + bodyBob, -0.6, {
        main: baseMainColor,
        shadeY: baseLightColor,
        shadeX: baseDarkColor,
        shadeZ: baseMainColor,
      }));

      // 2. Classical Minecraft Mane (Shoulder fluff/cape) - Spongy block behind head
      parts.push(createBox(2.4, 2.4, 2.2, 0, 0.6 + bodyBob, 1.3, {
        main: baseLightColor,
        shadeY: '#FFFFFF',
        shadeX: baseDarkColor,
        shadeZ: baseLightColor,
      }));

      // 3. Perfect Minecraft Blocky Head (attached to look direction, rotates around neck pivot)
      const lookYaw = mousePos.x * 0.45;
      const lookPitch = mousePos.y * 0.3;
      parts.push(createBox(1.6, 1.6, 1.6, 0, -1.0 + bodyBob + headBob, 2.4, {
        main: baseMainColor,
        shadeY: baseLightColor,
        shadeX: baseDarkColor,
        shadeZ: baseMainColor,
      }, { rx: lookPitch, ry: lookYaw, rz: lookYaw * 0.1 }));

      // 4. Prominent Minecraft Muzzle/Snout
      parts.push(createBox(0.8, 0.8, 1.0, 0, -0.6 + bodyBob + headBob, 3.5, {
        main: baseDarkColor,
        shadeY: baseMainColor,
        shadeX: '#ACA89E',
        shadeZ: baseDarkColor,
      }, { rx: lookPitch, ry: lookYaw, rz: lookYaw * 0.1 }));

      // 5. Classic Nose Tip (Very small black voxel on snout tip)
      parts.push(createBox(0.4, 0.3, 0.2, 0, -0.9 + bodyBob + headBob, 4.05, {
        main: '#111111',
        shadeY: '#000000',
        shadeX: '#000000',
        shadeZ: '#111111',
      }, { rx: lookPitch, ry: lookYaw, rz: lookYaw * 0.1 }));

      // 6 & 7. Left/Right Minecraft Upright Pointy ears
      parts.push(createBox(0.4, 0.5, 0.3, -0.6, -2.0 + bodyBob + headBob, 2.2, {
        main: baseMainColor,
        shadeY: baseLightColor,
        shadeX: baseDarkColor,
        shadeZ: baseMainColor,
      }, { rx: lookPitch, ry: lookYaw, rz: lookYaw * 0.1 }));

      parts.push(createBox(0.4, 0.5, 0.3, 0.6, -2.0 + bodyBob + headBob, 2.2, {
        main: baseMainColor,
        shadeY: baseLightColor,
        shadeX: baseDarkColor,
        shadeZ: baseMainColor,
      }, { rx: lookPitch, ry: lookYaw, rz: lookYaw * 0.1 }));

      // 8 & 9. Blocky eyes on the side of the face
      parts.push(createBox(0.25, 0.25, 0.1, -0.85, -1.0 + bodyBob + headBob, 3.1, {
        main: '#1C1C1C',
        shadeY: '#000000',
        shadeX: '#000000',
      }, { rx: lookPitch, ry: lookYaw, rz: lookYaw * 0.1 }));

      parts.push(createBox(0.25, 0.25, 0.1, 0.85, -1.0 + bodyBob + headBob, 3.1, {
        main: '#1C1C1C',
        shadeY: '#000000',
        shadeX: '#000000',
      }, { rx: lookPitch, ry: lookYaw, rz: lookYaw * 0.1 }));

      // 10. Iconic Minecraft Red Collar Block wraps neck below mane
      parts.push(createBox(2.0, 2.0, 0.45, 0, 0.2 + bodyBob, 2.15, {
        main: collarColor,
        shadeY: '#E55C5C',
        shadeX: '#A83B3B',
        shadeZ: collarColor,
      }));

      // 11. Brass Golden Tag hanging from the red collar
      parts.push(createBox(0.35, 0.35, 0.1, 0, 0.8 + bodyBob, 2.4, {
        main: tagColor,
        shadeY: '#FFF07C',
        shadeX: '#B89B2E',
        shadeZ: tagColor,
      }));

      // FOUR COLUMN LEGS
      // LF: Left Front
      parts.push(createBox(0.5, 2.0, 0.5, -0.8, 2.3 + bodyBob, 1.2, {
        main: baseMainColor,
        shadeY: baseLightColor,
        shadeX: baseDarkColor,
      }, { rx: leftLegAngle, ry: 0, rz: 0 }));

      // RF: Right Front
      parts.push(createBox(0.5, 2.0, 0.5, 0.8, 2.3 + bodyBob, 1.2, {
        main: baseMainColor,
        shadeY: baseLightColor,
        shadeX: baseDarkColor,
      }, { rx: rightLegAngle, ry: 0, rz: 0 }));

      // LB: Left Back
      parts.push(createBox(0.5, 2.0, 0.5, -0.8, 2.3 + bodyBob, -1.6, {
        main: baseMainColor,
        shadeY: baseLightColor,
        shadeX: baseDarkColor,
      }, { rx: leftBackLegAngle, ry: 0, rz: 0 }));

      // RB: Right Back
      parts.push(createBox(0.5, 2.0, 0.5, 0.8, 2.3 + bodyBob, -1.6, {
        main: baseMainColor,
        shadeY: baseLightColor,
        shadeX: baseDarkColor,
      }, { rx: rightBackLegAngle, ry: 0, rz: 0 }));

      // 12. Classic Minecraft Rectangular Tail (Horizontal, slightly perked)
      parts.push(createBox(0.4, 0.4, 1.8, 0, 0.3 + bodyBob, -2.5, {
        main: baseDarkColor,
        shadeY: baseMainColor,
        shadeX: '#9E9A90',
      }, { rx: 0.25, ry: tailAngle, rz: 0 }));

      // Combine all vertices and map indices correctly
      let combinedVerts: Point3D[] = [];
      let combinedFaces: Face[] = [];

      parts.forEach(part => {
        const offset = combinedVerts.length;
        combinedVerts = [...combinedVerts, ...part.vertices];
        const mappedFaces = part.faces.map(f => ({
          ...f,
          indices: f.indices.map(i => i + offset)
        }));
        combinedFaces = [...combinedFaces, ...mappedFaces];
      });

      // 3D rotation parameters
      const theta = rotation.theta; // Yaw
      const phi = rotation.phi;     // Pitch

      // Apply primary camera/drag rotations
      const transformedVerts = combinedVerts.map(v => {
        // Rotate Y (theta)
        let x1 = v.x * Math.cos(theta) - v.z * Math.sin(theta);
        let y1 = v.y;
        let z1 = v.x * Math.sin(theta) + v.z * Math.cos(theta);

        // Rotate X (phi)
        let x2 = x1;
        let y2 = y1 * Math.cos(phi) - z1 * Math.sin(phi);
        let z2 = y1 * Math.sin(phi) + z1 * Math.cos(phi);

        return { x: x2, y: y2, z: z2 };
      });

      // Painter's algorithm calculation: compute average depth (z-coord) of each face
      const indexedFacesWithZ = combinedFaces.map((face, index) => {
        let avgZ = 0;
        face.indices.forEach(idx => {
          avgZ += transformedVerts[idx].z;
        });
        avgZ /= face.indices.length;
        return { face, avgZ, index };
      });

      // Sort faces by depth (back to front, descending Z)
      indexedFacesWithZ.sort((a, b) => b.avgZ - a.avgZ);

      // Render the sorted faces in light theme aesthetic
      indexedFacesWithZ.forEach(({ face }) => {
        // Simple backface culling to skip rendering reverse faces
        const p0 = transformedVerts[face.indices[0]];
        const p1 = transformedVerts[face.indices[1]];
        const p2 = transformedVerts[face.indices[2]];
        
        // Face normal using cross-product coordinates
        const v1x = p1.x - p0.x;
        const v1y = p1.y - p0.y;
        const v2x = p2.x - p0.x;
        const v2y = p2.y - p0.y;
        const normalZ = v1x * v2y - v1y * v2x;

        if (normalZ > 0) {
          // Render shadows and colors delicately depending on lighting vector
          ctx.beginPath();
          ctx.moveTo(centerX + p0.x * scale, centerY + p0.y * scale);
          
          for (let i = 1; i < face.indices.length; i++) {
            const pt = transformedVerts[face.indices[i]];
            ctx.lineTo(centerX + pt.x * scale, centerY + pt.y * scale);
          }
          
          ctx.closePath();
          
          // Setup custom light source angle for the "Daylight" thematic feeling
          const lightIntensity = Math.max(0.4, 1.0 - (normalZ / 10000));
          ctx.fillStyle = face.color;
          ctx.fill();

          // Delicate aesthetic wireframe styling for low-poly art feel
          ctx.strokeStyle = 'rgba(235, 230, 220, 0.35)'; // Crisp light edges
          ctx.lineWidth = 0.55;
          ctx.stroke();
        }
      });

      // Draw a sleek circular shadow beneath the dog
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 4.2 * scale + bodyBob, 2.5 * scale, 0.7 * scale, 0, 0, 2 * Math.PI);
      ctx.fillStyle = 'rgba(28, 28, 28, 0.08)';
      ctx.fill();

      // Request next frame
      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
    };
  }, [rotation, mousePos, animationState, dogAction]);

  // Handle Drag interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    rotationStart.current = { theta: rotation.theta, phi: rotation.phi };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setRotation({
      theta: rotationStart.current.theta + dx * 0.015,
      phi: Math.max(-1.4, Math.min(1.4, rotationStart.current.phi + dy * 0.015))
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div 
        className="relative bg-white/40 border border-[#E5E1D8] w-full max-w-[280px] h-[260px] rounded-[32px] cursor-grab active:cursor-grabbing overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
      >
        <canvas 
          ref={canvasRef} 
          width={280} 
          height={260} 
          className="w-full h-full block"
        />

        {/* Floating Instruction */}
        <span className="absolute top-3 left-1/2 -translate-x-1/2 text-[8px] uppercase tracking-[0.2em] font-mono text-[#7C7872] pointer-events-none select-none bg-white/70 px-2 py-0.5 rounded-full border border-stone-200">
          Drag to orbit 3D
        </span>
      </div>

      {/* Interact Play Belt */}
      <div className="grid grid-cols-3 gap-1.5 w-full max-w-[280px]">
        {[
          { code: 'idle', icon: '🐕', label: 'Idle' },
          { code: 'walk', icon: '🚶', label: 'Walk' },
          { code: 'greet', icon: '👋', label: 'Greet' },
          { code: 'sit', icon: '🧘', label: 'Sit' },
          { code: 'beg', icon: '🙏', label: 'Beg' },
          { code: 'wag', icon: '⚡', label: 'Wag' }
        ].map((item) => (
          <button
            key={item.code}
            onClick={() => setDogAction(item.code as any)}
            className={`py-1.5 px-1 text-[10px] rounded-xl transition-all border font-medium flex flex-col items-center gap-0.5 ${
              dogAction === item.code 
                ? 'bg-[#1C1C1C] text-white border-[#1C1C1C] shadow-sm' 
                : 'bg-white text-[#1C1C1C] border-[#E5E1D8] hover:bg-neutral-50 shadow-xs'
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
